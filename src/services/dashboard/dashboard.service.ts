import {DashboardResponseDTO, IDashboard} from '../../shared/models/DTO/DashboardResponseDTO';
import {InternalServerErrorException} from '../../shared/exceptions/http.exceptions';
import UserModel from '../../databases/schema/user.schema';
import OrderModel from '../../databases/schema/order.schema';
import to from 'await-to-js';

export const getDashboardData = async (): Promise<DashboardResponseDTO> => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1); // Start from the 1st of that month

    const [orderError, orderAggregation] = await to(
        OrderModel.aggregate([
            {
                $match: {
                    paymentStatus: 'SUCCESS',
                    date: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' }
                    },
                    totalSales: { $sum: '$amount' }
                }
            },
            {
                $sort: {
                    '_id.year': 1,
                    '_id.month': 1
                }
            }
        ])
    );

    if (orderError) {
        throw new InternalServerErrorException('Failed to get chart data');
    }

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const currentDate = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        months.push({
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            label: monthNames[date.getMonth()]
        });
    }

    const chartData = months.map(m => {
        const found = orderAggregation.find(
            (item: any) => item._id.year === m.year && item._id.month === m.month
        );
        return {
            month: m.label,
            sales: found ? found.totalSales : 0
        };
    });

    const [salesError, totalSales] = await to(
        OrderModel.aggregate([
            { $match: { paymentStatus: 'SUCCESS' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ])
    );

    if (salesError) {
        throw new InternalServerErrorException('Failed to calculate total sales');
    }

    const [completedError, completedOrdersCount] = await to(
        OrderModel.countDocuments({ status: 'COMPLETED' })
    );

    if (completedError) {
        throw new InternalServerErrorException('Failed to count completed orders');
    }

    const [userError, customerCount] = await to(
        UserModel.countDocuments({ role: 'USER' })
    );

    if (userError) {
        throw new InternalServerErrorException('Failed to count users');
    }

    const dashboard: IDashboard = {
        salesCount: totalSales[0]?.total || 0,
        orderCount: completedOrdersCount,
        customerCount,
        chartData
    };

    return DashboardResponseDTO.toResponse(dashboard);
};
