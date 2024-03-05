import express from "express"
import { Prisma } from "@prisma/client"
import prisma from "../utils/prisma.js"
import auth from "../middlewares/auth.js"
const router = express.Router()

// upload image
router.post('/', auth, async (req, res) => {
    const data = req.body;
    console.log(req.user.payload.id)
    console.log(data)

    prisma.image.create({
        data:{
            ...data,
            userId: req.user.payload.id
        }
    }).then((image) => {
        return res.json(image);
    }).catch(err => {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
            const formattedError = {}
            formattedError[`${err.meta.target[0]}`] = 'already taken'
      
            return res.status(500).send({
              error: formattedError
            });  // friendly error handling
          }
          throw err  // if this happens, our backend application will crash and not respond to the client. because we don't recognize this error yet, we don't know how to handle it in a friendly manner. we intentionally throw an error so that the error monitoring service we'll use in production will notice this error and notify us and we can then add error handling to take care of previously unforeseen errors.
        })
  });

// view all image
router.get('/', async (req, res) => {
  try {
    const images = await prisma.image.findMany(); 
    return res.json(images);
} catch (error) {
    console.error("Error retrieving images:", error);
    return res.status(500).send({ error: "Internal Server Error" });
}
});

// view image by id
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const image = await prisma.image.findUnique({
        where: {
            id: id
        }
    });
    return res.json(image);
} catch (error) {
    console.error("Error retrieving image by ID:", error);
    return res.status(500).send({ error: "Internal Server Error" });
}
});

// update image
router.put('/:id', async (req, res) => {
  try {
    // Retrieve the image ID from the request parameters
    const id = parseInt(req.params.id);

    // Retrieve the updated image data from the request body
    const updatedImageData = req.body;

    // Query the database to find the image with the specified ID
    const existingImage = await prisma.image.findUnique({
      where: {
        id: id
      }
    });

    // If the image is not found, return a 404 Not Found response
    if (!existingImage) {
      return res.status(404).send({ "error": "Image not found" });
    }

    // Update the image data in the database
    const updatedImage = await prisma.image.update({
      where: {
        id: id
      },
      data: updatedImageData
    });

    // Return the updated image data
    return res.status(200).json(updatedImage);
  } catch (error) {
    console.error("Error updating specified image", error);
    return res.status(500).send({ "error": "Internal Server Error" });
  }
});

// delete image by ID
router.delete('/:id', async (req, res) => {
  try {
    // Retrieve the image ID from the request parameters
    const id = parseInt(req.params.id);

    // Query the database to find the image with the specified ID
    const image = await prisma.image.findUnique({
      where: {
        id: id
      }
    });

    // If the image is not found, return a 404 Not Found response
    if (!image) {
      return res.status(404).send({ "error": "Image not found" });
    }

    // Check if the user is authorized to delete the image (if needed)

    // Delete the image from the database
    await prisma.image.delete({
      where: {
        id: id
      }
    });

    // Return a success message
    return res.status(200).send({ "message": "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting specified image", error);
    return res.status(500).send({ "error": "Internal Server Error" });
  }
});

export default router
