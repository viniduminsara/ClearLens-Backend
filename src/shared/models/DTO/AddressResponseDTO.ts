import {IAddress} from '../../../databases/model/address.model';

export class AddressResponseDTO {
    _id!: string;
    fullName!: string;
    mobileNumber!: string;
    houseNo!: string;
    street!: string;
    city!: string;
    postalCode!: string;

    static toResponse(address: IAddress): AddressResponseDTO {
        const addressDTO = new AddressResponseDTO();
        addressDTO._id = address._id;
        addressDTO.fullName = address.fullName;
        addressDTO.mobileNumber = address.mobileNumber;
        addressDTO.houseNo = address.houseNo;
        addressDTO.street = address.street;
        addressDTO.city = address.city;
        addressDTO.postalCode = address.postalCode;

        return addressDTO;
    }
}
