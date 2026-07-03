import { NextResponse } from "next/server";

// Swagger/OpenAPI 3.0 specifikacija - dostupna na GET /api/docs
// Swagger UI straniva (src/app/swagger/page.tsx) ucitava ovaj JSON i prikazuje ga vizuelno
const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Bibi Salon API",
    version: "1.0.0",
    description:
      "API specifikacija za aplikaciju za zakazivanje termina frizerskog salona Bibi. " +
      "Autentifikacija koristi JWT token smesten u httpOnly cookie (postavlja se automatski nakon /auth/login).",
  },
  servers: [{ url: "/api", description: "Development server (localhost:3000)" }],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "auth",
        description: "JWT token u httpOnly cookie-ju. Postavlja se automatski nakon /auth/login.",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", example: "44444444-4444-4444-4444-444444444444" },
          fullName: { type: "string", example: "Ana Anić" },
          email: { type: "string", format: "email", example: "ana@gmail.com" },
          role: { type: "string", enum: ["client", "employee", "admin"], example: "client" },
        },
      },
      Category: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "Feniranje" },
          slug: { type: "string", example: "feniranje" },
          parentId: { type: "string", format: "uuid", nullable: true },
        },
      },
      Service: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "Feniranje na ravno - kratka kosa" },
          description: { type: "string", nullable: true },
          price: { type: "string", example: "1200" },
          durationMinutes: { type: "integer", example: 30 },
          image: { type: "string", nullable: true },
          categoryId: { type: "string", format: "uuid" },
        },
      },
      Employee: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          fullName: { type: "string", example: "Jovana Jovanović" },
          specialization: { type: "string", nullable: true, example: "Feniranje, Frizure" },
        },
      },
      Appointment: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          date: { type: "string", format: "date", example: "2026-08-01" },
          time: { type: "string", example: "10:00:00" },
          status: {
            type: "string",
            enum: ["pending", "confirmed", "cancelled", "completed"],
            example: "pending",
          },
          note: { type: "string", nullable: true },
          serviceName: { type: "string", example: "Feniranje na ravno - kratka kosa" },
          employeeName: { type: "string", example: "Jovana Jovanović" },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: { type: "string", example: "Pogrešan email ili lozinka" },
        },
      },
    },
  },
  paths: {
    "/auth/register": {
      post: {
        tags: ["Autentifikacija"],
        summary: "Registracija novog korisnika",
        description:
          "Kreira novi korisnički nalog sa rolom 'client'. Vraća JWT token u httpOnly cookie-ju i podatke o korisniku.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["fullName", "email", "password"],
                properties: {
                  fullName: { type: "string", example: "Ana Anić" },
                  email: { type: "string", format: "email", example: "nova@gmail.com" },
                  password: { type: "string", example: "lozinka123" },
                  phone: { type: "string", example: "0611234567" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Uspešna registracija",
            content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } },
          },
          "400": {
            description: "Email već postoji ili nedostaju podaci",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Autentifikacija"],
        summary: "Prijava korisnika",
        description:
          "Prima email i lozinku, proverava u bazi, i postavlja JWT token u httpOnly cookie. Demo: ana@gmail.com / lozinka123",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email", example: "ana@gmail.com" },
                  password: { type: "string", example: "lozinka123" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Uspešna prijava",
            content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } },
          },
          "401": {
            description: "Pogrešan email ili lozinka",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Autentifikacija"],
        summary: "Odjava korisnika",
        description: "Briše auth cookie postavljajući ga na istekao.",
        responses: {
          "200": {
            description: "Uspešna odjava",
            content: {
              "application/json": {
                schema: { type: "object", properties: { ok: { type: "boolean", example: true } } },
              },
            },
          },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Autentifikacija"],
        summary: "Podaci o prijavljenom korisniku",
        description: "Čita JWT token iz cookie-ja i vraća podatke o korisniku. Vraća { user: null } ako nije prijavljen.",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": {
            description: "Podaci o korisniku ili null",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: { oneOf: [{ $ref: "#/components/schemas/User" }, { type: "null" }] },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/categories": {
      get: {
        tags: ["Kategorije"],
        summary: "Lista glavnih grupa usluga",
        description: "Javna ruta. Vraća glavne grupe: Feniranje, Farbanje, Tretmani, Frizure.",
        responses: {
          "200": {
            description: "Lista kategorija",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Category" } },
              },
            },
          },
        },
      },
    },
    "/categories/sub": {
      get: {
        tags: ["Kategorije"],
        summary: "Podgrupe za određenu grupu",
        description: "Javna ruta. Vraća podgrupe za dati parentId (npr. podgrupe Feniranja).",
        parameters: [
          {
            name: "parentId",
            in: "query",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "ID glavne kategorije",
          },
        ],
        responses: {
          "200": {
            description: "Lista podgrupa",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Category" } },
              },
            },
          },
          "400": {
            description: "parentId nije prosleđen",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/services": {
      get: {
        tags: ["Usluge"],
        summary: "Lista svih usluga",
        description: "Javna ruta. Može se filtrirati po categoryId query parametru.",
        parameters: [
          {
            name: "categoryId",
            in: "query",
            required: false,
            schema: { type: "string", format: "uuid" },
            description: "Filtriranje usluga po kategoriji",
          },
        ],
        responses: {
          "200": {
            description: "Lista usluga",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Service" } },
              },
            },
          },
        },
      },
      post: {
        tags: ["Usluge"],
        summary: "Kreiranje nove usluge (samo admin)",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "price", "categoryId"],
                properties: {
                  name: { type: "string", example: "Nova usluga" },
                  description: { type: "string" },
                  price: { type: "string", example: "2000" },
                  durationMinutes: { type: "integer", example: 60 },
                  categoryId: { type: "string", format: "uuid" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Usluga kreirana",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Service" } } },
          },
          "401": { description: "Niste prijavljeni" },
          "403": { description: "Nemate dozvolu - nije admin" },
        },
      },
    },
    "/services/{id}": {
      get: {
        tags: ["Usluge"],
        summary: "Detalji jedne usluge",
        description: "Javna ruta.",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          "200": { description: "Podaci o usluzi", content: { "application/json": { schema: { $ref: "#/components/schemas/Service" } } } },
          "404": { description: "Usluga nije pronađena" },
        },
      },
      put: {
        tags: ["Usluge"],
        summary: "Izmena usluge (samo admin)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          "200": { description: "Usluga izmenjena" },
          "401": { description: "Niste prijavljeni" },
          "403": { description: "Nemate dozvolu" },
          "404": { description: "Usluga nije pronađena" },
        },
      },
      delete: {
        tags: ["Usluge"],
        summary: "Brisanje usluge (samo admin)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          "200": { description: "Usluga obrisana" },
          "401": { description: "Niste prijavljeni" },
          "403": { description: "Nemate dozvolu" },
        },
      },
    },
    "/employees": {
      get: {
        tags: ["Frizeri"],
        summary: "Lista frizera",
        description: "Javna ruta. Koristi se u formi za zakazivanje termina.",
        responses: {
          "200": {
            description: "Lista frizera",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Employee" } },
              },
            },
          },
        },
      },
    },
    "/appointments": {
      get: {
        tags: ["Termini"],
        summary: "Lista termina prijavljenog korisnika",
        description: "Zahteva autentifikaciju. Klijent vidi samo svoje termine, admin vidi sve.",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": {
            description: "Lista termina",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Appointment" } },
              },
            },
          },
          "401": { description: "Niste prijavljeni" },
        },
      },
      post: {
        tags: ["Termini"],
        summary: "Zakazivanje novog termina",
        description: "Zahteva autentifikaciju. Termin se dodeljuje prijavljenom korisniku.",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["serviceId", "employeeId", "date", "time"],
                properties: {
                  serviceId: { type: "string", format: "uuid" },
                  employeeId: { type: "string", format: "uuid" },
                  date: { type: "string", format: "date", example: "2026-08-01" },
                  time: { type: "string", example: "10:00" },
                  note: { type: "string", example: "Alergija na određene boje" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Termin zakazan", content: { "application/json": { schema: { $ref: "#/components/schemas/Appointment" } } } },
          "400": { description: "Nedostaju obavezni podaci" },
          "401": { description: "Niste prijavljeni" },
        },
      },
    },
    "/appointments/{id}": {
      put: {
        tags: ["Termini"],
        summary: "Izmena statusa termina",
        description: "Vlasnik termina ili osoblje (employee/admin). Npr. za potvrdu ili otkazivanje.",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", enum: ["pending", "confirmed", "cancelled", "completed"] },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Termin izmenjen" },
          "401": { description: "Niste prijavljeni" },
          "403": { description: "Nemate dozvolu" },
          "404": { description: "Termin nije pronađen" },
        },
      },
      delete: {
        tags: ["Termini"],
        summary: "Otkazivanje termina",
        description: "Vlasnik termina ili admin.",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          "200": { description: "Termin otkazan" },
          "401": { description: "Niste prijavljeni" },
          "403": { description: "Nemate dozvolu" },
        },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(swaggerSpec);
}
