import Joi from 'joi';

export const createOrderValidationSchema = Joi.object({
    amount: Joi.number().min(1).required(),

    address: Joi.object({
        _id: Joi.string().length(24).required()
    }).unknown(true).required(),

    orderItems: Joi.array()
        .items(
            Joi.object({
                product: Joi.object({
                    _id: Joi.string().length(24).required()
                }).unknown(true).required(),
                qty: Joi.number().min(1).required()
            })
        )
        .min(1)
        .required(),
});

export const completePaymentValidationSchema = Joi.object({
    _id: Joi.string().length(24).required(),
    paymentStatus: Joi.string()
        .valid('PENDING', 'SUCCESS', 'FAILED')
        .required(),
});

