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
  })

// Test for valid data
  it("with valid data should return 200", async () => {
    const response = await request(app)
      .post("/users")
      .send(user)
      .set('Accept', 'application/json')
    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBeTruthy;
    expect(response.body.name).toBe(user.name);
    expect(response.body.email).toBe(user.email);
    expect(response.body.password).toBe(undefined);
  });

// Test when email is existed
it("with same email should fail", async () => {
  const response = await request(app)
    .post("/users")
    .send(user)
    .set('Accept', 'application/json')
  expect(response.statusCode).toBe(500);
  expect(response.body.error).toBeTruthy;
  expect(response.body.error.email).toBe('already taken');
});

// Test when password is invalid
it("with invalid password should fail", async () => {
  user.password = "short"
   const response = await request(app)
    .post("/users")
    .send(user)
    .set('Accept', 'application/json');
  expect(response.statusCode).toBe(400);
  expect(response.body.error).toBeTruthy;
  expect(response.body.error.password).toBe('should be at least 8 characters');
});

// Test with invalid email 
it("with invalid email should fail", async () => {
  user.email = 'unique@example_com_'
  const response = await request(app)
    .post("/users")
    .send(user)
    .set('Accept', 'application/json')
  expect(response.statusCode).toBe(400);
  expect(response.body.error).toBeTruthy;
  expect(response.body.error.email).toBe("is invalid");
});

// Test when name is blank  
it("with name is blank", async () => {
  user.name = ''
  const response = await request(app)
    .post("/users")
    .send(user)
    .set('Accept', 'application/json')
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBeTruthy;
    expect(response.body.error.name).toBe("cannot be blank");
});
})



