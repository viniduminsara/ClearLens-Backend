import md5 from 'crypto-js/md5';
import {InternalServerErrorException} from '../exceptions/http.exceptions';

export const hashPaymentDetails = (orderId: string, amount: number) => {

    if (!process.env.MERCHANT_ID || !process.env.MERCHANT_SECRET) {
        throw new InternalServerErrorException('MERCHANT_ID or MERCHANT_SECRET is not defined in environment variables');
    }

    const merchantSecret  = process.env.MERCHANT_SECRET;
    const merchantId      = process.env.MERCHANT_ID;
    const hashedSecret    = md5(merchantSecret).toString().toUpperCase();
    const amountFormated  = parseFloat( String(amount) ).toLocaleString( 'en-us', { minimumFractionDigits : 2 } ).replaceAll(',', '');
    const currency = 'LKR';
    return md5(merchantId + orderId + amountFormated + currency + hashedSecret).toString().toUpperCase();
}
