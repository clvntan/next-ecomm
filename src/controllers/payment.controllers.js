import express from "express"
import Stripe from "stripe"
import prisma from "../utils/prisma.js"

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

router.post('/', async (req, res) => {
const id = req.body
console.log(id)
const image = await prisma.image.findUnique ({
    where : {
        id : id.id
    }
})

const session = await stripe.checkout.sessions.create({
  line_items: [
    {
      price_data: {
        currency: 'usd',
        product_data: {
          name: image.title,
          description: image.description,
        },
        unit_amount: image.price * 100,
      },
      quantity: 1,
    },
  ],
  mode: 'payment',
  success_url: 'http://localhost:5173/',
  cancel_url: 'http://localhost:5173/',
});

return res.json(session.url);

});

export default router