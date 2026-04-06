import { revalidatePath } from 'next/cache';

export function revalidateTicketCollections() {
  revalidatePath('/dashboard');
  revalidatePath('/tickets');
  revalidatePath('/admin');
  revalidatePath('/admin/tickets');
  revalidatePath('/technician');
}

export function revalidateTicketDetail(ticketId: string) {
  revalidatePath(`/tickets/${ticketId}`);
  revalidatePath(`/admin/tickets/${ticketId}`);
  revalidatePath(`/technician/tickets/${ticketId}`);
}

export function revalidateTicketWorkflow(ticketId: string) {
  revalidateTicketCollections();
  revalidateTicketDetail(ticketId);
}
