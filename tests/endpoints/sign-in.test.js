import { PrismaClient, Prisma } from '@prisma/client'
import request from "supertest"
import app from "../../app.js"

async function cleanupDatabase() {
  const prisma = new PrismaClient();
  const modelNames = Prisma.dmmf.datamodel.models.map((model) => model.name);

  return Promise.all(
    modelNames.map((modelName) => prisma[modelName.toLowerCase()].deleteMany())
  );
}

describe("POST /users", () => {
  const user = {
    name: 'John',
    email: 'john9@example.com',
    password: 'insecure',
  }

  beforeAll(async () => {
    await cleanupDatabase()

  })

  afterAll(async () => {
    await cleanupDatabase()
  });

// Test for creating a user using sign up endpoint then test auth endpoint to make sure accessToken is returned
it("should return accessToken with valid credentials", async () => {
    await request(app)
    .post("/users")
    .send(user)
    .set("Accept", "application/json");

    const signInRes = await request(app)
    .post("/auth")
    .send(user)
    .set("Accept", "application/json");
    expect(signInRes.statusCode).toBe(200);
    expect(signInRes.body.accessToken).toBeTruthy();   
    });

    // Test with auth endpoint with wrong email
    it("should return 401 with wrong email", async () => {
      user.email = "john111@examplecom"
      await request(app)
      .post("/users")
      .send(user)
      .set("Accept", "application/json");
  
      const signInRes = await request(app)
      .post("/auth")
      .send(user)
      .set("Accept", "application/json");
      expect(signInRes.statusCode).toBe(401);
      expect(signInRes.body.accessToken).toBeFalsy;   
      expect(signInRes.body.error.email).toBe("is invalid")
   });

   // Test with auth endpoint with wrong password
it("should return 401 with wrong password", async () => {
  user.password = ""
  await request(app)
  .post("/users")
  .send(user)
  .set("Accept", "application/json");

  const signInRes = await request(app)
  .post("/auth")
  .send(user)
  .set("Accept", "application/json");
  expect(signInRes.statusCode).toBe(401);
  expect(signInRes.body.error.password).toBe("cannot be blank");   
});
});




