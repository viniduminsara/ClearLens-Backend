import {OrderResponseDTO} from './OrderResponseDTO';
import {IOrder} from '../../../databases/model/order.model';

export class PaymentHashResponseDTO {
    order!: OrderResponseDTO;
    hash!: string;

    static toResponse(order: IOrder, hash: string) {
        const orderDTO = OrderResponseDTO.toResponse(order);

        const paymentHashResponseDTO =  new PaymentHashResponseDTO();
        paymentHashResponseDTO.order = orderDTO;
        paymentHashResponseDTO.hash = hash;

        return paymentHashResponseDTO;
    }
}
