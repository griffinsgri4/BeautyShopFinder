import { ref, onValue, set, get, push } from 'firebase/database';
import { getDatabase } from 'firebase/database';
const database = getDatabase();

export interface Appointment {
  id: string;
  shopId: string;
  userId: string;
  service: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  price: string;
  duration: string;
}

export const appointmentService = {
  // Create a new appointment
  createAppointment: async (appointment: Omit<Appointment, 'id' | 'status'>): Promise<string> => {
    const appointmentsRef = ref(database, 'appointments');
    const newAppointmentRef = push(appointmentsRef);
    const newAppointment: Appointment = {
      ...appointment,
      id: newAppointmentRef.key!,
      status: 'upcoming'
    };
    await set(newAppointmentRef, newAppointment);
    return newAppointmentRef.key!;
  },

  // Get all appointments for a user
  getUserAppointments: async (userId: string): Promise<Appointment[]> => {
    const appointmentsRef = ref(database, 'appointments');
    const snapshot = await get(appointmentsRef);
    const data = snapshot.val();
    if (!data) return [];
    
    return Object.values(data)
      .filter((appointment: Appointment) => appointment.userId === userId)
      .sort((a: Appointment, b: Appointment) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });
  },

  // Subscribe to user appointments updates
  subscribeToUserAppointments: (userId: string, callback: (appointments: Appointment[]) => void) => {
    const appointmentsRef = ref(database, 'appointments');
    return onValue(appointmentsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        callback([]);
        return;
      }
      
      const userAppointments = Object.values(data)
        .filter((appointment: Appointment) => appointment.userId === userId)
        .sort((a: Appointment, b: Appointment) => {
          const dateA = new Date(`${a.date} ${a.time}`);
          const dateB = new Date(`${b.date} ${b.time}`);
          return dateA.getTime() - dateB.getTime();
        });
      callback(userAppointments);
    });
  },

  // Update appointment status
  updateAppointmentStatus: async (appointmentId: string, status: Appointment['status']) => {
    const appointmentRef = ref(database, `appointments/${appointmentId}`);
    const snapshot = await get(appointmentRef);
    const appointment = snapshot.val();
    if (!appointment) throw new Error('Appointment not found');
    
    await set(appointmentRef, {
      ...appointment,
      status
    });
  },

  // Cancel appointment
  cancelAppointment: async (appointmentId: string) => {
    return appointmentService.updateAppointmentStatus(appointmentId, 'cancelled');
  }
};