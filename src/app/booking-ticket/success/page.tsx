import Link from "next/link";
import { prisma } from "@/lib/db";
import { CheckCircle2, Calendar, MapPin, Users, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "../BookingTicket.module.css";

export const dynamic = "force-dynamic";

export default async function TicketSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { booking_id } = await searchParams;

  const booking = await prisma.ticketBooking.findUnique({
    where: { id: booking_id },
  });

  if (!booking) {
    return (
      <>
        <Navbar />
        <div style={{ padding: '100px 20px', textAlign: 'center' }}>
          <h1>Booking Not Found</h1>
          <Link href="/">Return Home</Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className={styles.page} style={{ paddingTop: '40px' }}>
        <div className={styles.container}>
          <div className={styles.card} style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <CheckCircle2 size={80} color="#1a4d43" />
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>Booking Received!</h1>
            <p style={{ color: '#666', marginBottom: '32px' }}>
              Your ticket booking has been received. Please complete the payment if you haven't already.
            </p>

            <div style={{ textAlign: 'left', background: '#f9f9f9', padding: '24px', borderRadius: '16px' }}>
              <h3 style={{ marginBottom: '16px', borderBottom: '1px solid #ddd', paddingBottom: '8px' }}>Booking Details</h3>
              
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <MapPin size={20} color="#1a4d43" />
                <div>
                  <div style={{ fontWeight: 600 }}>Gates</div>
                  <div style={{ fontSize: '0.9rem', color: '#555' }}>
                    {booking.entrance_gate} to {booking.exit_gate}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <Calendar size={20} color="#1a4d43" />
                <div>
                  <div style={{ fontWeight: 600 }}>Trekking Dates</div>
                  <div style={{ fontSize: '0.9rem', color: '#555' }}>
                    {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <Users size={20} color="#1a4d43" />
                <div>
                  <div style={{ fontWeight: 600 }}>Participants</div>
                  <div style={{ fontSize: '0.9rem', color: '#555' }}>{booking.number_of_pax} Person(s)</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <ShieldCheck size={20} color="#1a4d43" />
                <div>
                  <div style={{ fontWeight: 600 }}>Insurance</div>
                  <div style={{ fontSize: '0.9rem', color: '#555', textTransform: 'capitalize' }}>
                    {booking.insurance_type} Insurance
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px dashed #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700 }}>Total Paid</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a4d43' }}>Rp {booking.total_price.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link href="/" className={styles.submitBtn}>
                Back to Home
              </Link>
              <p style={{ fontSize: '0.85rem', color: '#888' }}>
                A confirmation email will be sent to <strong>{booking.email}</strong> once payment is confirmed.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
