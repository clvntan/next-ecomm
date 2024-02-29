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

describe("POST /sign-in", () => {

  beforeAll(async () => {
    await cleanupDatabase()

  })

  afterAll(async () => {
    await cleanupDatabase()
  });

// Test for creating a user using sign up endpoint then test sign-in endpoint to make sure accessToken is returned
it("should return accessToken with valid credentials", async () => {
    const signUpRes = await request(app)
    .post("/users")
    .send({name: "John", email: "john9@example.com", password: "insecure"});

    const signInRes = await request(app)
    .post("/sign-in")
    .send({email: "john9@example.com", password: "insecure"})
    .set("Accept", "application/json");
    expect(signInRes.statusCode).toBe(200);
    expect(signInRes.body.accessToken).toBeTruthy();   
    });
});

// Test with sign-in endpoint with wrong email
it("should return 401 with wrong email", async () => {
    const signUpRes = await request(app)
    .post("/users")
    .send({name: "John", email: "john9@example.com", password: "insecure"});

    const signInRes = await request(app)
    .post("/sign-in")
    .send({email: "john@example.com", password: "insecure"})
    .set("Accept", "application/json");
    expect(signInRes.statusCode).toBe(401);
    expect(signInRes.body.accessToken).toBe(undefined);   
 });

// Test with sign-in endpoint with wrong password
it("should return 401 with wrong password", async () => {
    const signUpRes = await request(app)
    .post("/users")
    .send({name: "John", email: "john9@example.com", password: "insecure"});

    const signInRes = await request(app)
    .post("/sign-in")
    .send({email: "john9@example.com", password: "secure"})
    .set("Accept", "application/json");
    expect(signInRes.statusCode).toBe(401);
    expect(signInRes.body.accessToken).toBe(undefined);   
 });