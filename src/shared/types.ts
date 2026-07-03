// Zajednički tipovi (DTO) koje koriste i API rute i frontend komponente

export type CategoryDto = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
};

export type ServiceDto = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  durationMinutes: number;
  image: string | null;
  categoryId: string;
};

export type EmployeeDto = {
  id: string;
  fullName: string;
  specialization: string | null;
};

export type AppointmentDto = {
  id: string;
  date: string;
  time: string;
  status: string;
  note: string | null;
  serviceName: string;
  employeeName: string;
};
