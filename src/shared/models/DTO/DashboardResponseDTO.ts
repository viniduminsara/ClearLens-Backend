export interface ChartDataItem {
    month: string;
    sales: number;
}

export interface IDashboard {
    salesCount: number;
    orderCount: number;
    customerCount: number;
    chartData: ChartDataItem[];
}

export class DashboardResponseDTO {
    salesCount!: number;
    ordersCount!: number;
    customersCount!: number;
    chartData!: ChartDataItem[];

    static toResponse(data: IDashboard) {
        const dashboardData = new DashboardResponseDTO();
        dashboardData.salesCount = data.salesCount;
        dashboardData.ordersCount = data.orderCount;
        dashboardData.customersCount = data.customerCount;
        dashboardData.chartData = data.chartData;

        return dashboardData;
    }
}
