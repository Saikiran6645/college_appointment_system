const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");

describe("College Appointment System", () => {
  let studentToken, professorToken;
  let professorId, studentId, availabilityId, appointmentId;

  beforeAll(async () => {
    // Mock Database Setup (Add Student and Professor Accounts)
    const student = await request(app).post("/auth/register").send({
      name: "Student A1",
      email: "student@example.com",
      password: "password",
      role: "student",
    });
    const professor = await request(app).post("/auth/register").send({
      name: "Professor P1",
      email: "prof@example.com",
      password: "password",
      role: "professor",
    });

    studentId = student.body._id;
    professorId = professor.body._id;

    // Authenticate Users
    const studentLogin = await request(app).post("/auth/login").send({
      email: "student@example.com",
      password: "password",
    });
    const professorLogin = await request(app).post("/auth/login").send({
      email: "prof@example.com",
      password: "password",
    });

    studentToken = studentLogin.body.token;
    professorToken = professorLogin.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  test("Professor adds availability", async () => {
    const res = await request(app)
      .post(`/professor/${professorId}/availability`)
      .set("Authorization", `Bearer ${professorToken}`)
      .send({
        slots: [
          { time: "2024-12-20T10:00:00Z" },
          { time: "2024-12-20T11:00:00Z" },
        ],
      });

    expect(res.status).toBe(200);
    availabilityId = res.body._id;
    expect(res.body.slots).toHaveLength(2);
  });

  test("Student views professor's available slots", async () => {
    const res = await request(app)
      .get(`/professor/${professorId}/availability`)
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.slots).toEqual(
      expect.arrayContaining([
        { time: "2024-12-20T10:00:00Z", is_booked: false },
      ])
    );
  });

  test("Student books an appointment", async () => {
    const res = await request(app)
      .post("/appointment/book")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        student_id: studentId,
        professor_id: professorId,
        time: "2024-12-20T10:00:00Z",
      });

    expect(res.status).toBe(200);
    appointmentId = res.body._id;
    expect(res.body.status).toBe("active");
  });

  test("Professor cancels an appointment", async () => {
    const res = await request(app)
      .delete("/appointment/cancel")
      .set("Authorization", `Bearer ${professorToken}`)
      .send({ appointment_id: appointmentId });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("canceled");
  });

  test("Student checks canceled appointment", async () => {
    const res = await request(app)
      .get(`/student/${studentId}/appointments`)
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0); // No active appointments
  });
});
