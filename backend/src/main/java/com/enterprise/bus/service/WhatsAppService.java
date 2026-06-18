package com.enterprise.bus.service;

import com.enterprise.bus.model.Booking;
import com.enterprise.bus.model.Passenger;
import org.springframework.stereotype.Service;
import java.util.stream.Collectors;

@Service
public class WhatsAppService {

    public void sendBookingConfirmation(Booking booking) {
        String phone = booking.getUser().getPhone();
        if (phone == null || phone.trim().isEmpty()) {
            phone = "+919876543210"; // Default fallback
        }

        String passengerNames = booking.getPassengers().stream()
                .map(Passenger::getPassengerName)
                .collect(Collectors.joining(", "));

        String seatNumbers = booking.getPassengers().stream()
                .map(Passenger::getSeatNumber)
                .collect(Collectors.joining(", "));

        String busTypeClean = booking.getTrip().getBus().getBusType()
                .replace("_", " ");

        // Build the WhatsApp message template
        StringBuilder msg = new StringBuilder();
        msg.append("========= WHATSAPP TICKET SIMULATOR =========\n");
        msg.append("To: ").append(phone).append(" (Passenger: ").append(passengerNames).append(")\n");
        msg.append("--------------------------------------------------\n");
        msg.append("*Rajni Bus Service - Ticket Confirmation* 🎫\n\n");
        msg.append("Dear ").append(booking.getUser().getUsername()).append(",\n");
        msg.append("Your booking is *CONFIRMED*! Here are your travel details:\n\n");
        msg.append("🎫 *Booking Ref*: ").append(booking.getBookingReference()).append("\n");
        msg.append("🚌 *Bus*: ").append(booking.getTrip().getBus().getBusNumber()).append(" (").append(busTypeClean).append(")\n");
        msg.append("📍 *Route*: ").append(booking.getTrip().getRoute().getSource()).append(" ➔ ").append(booking.getTrip().getRoute().getDestination()).append("\n");
        msg.append("🕒 *Departure*: ").append(booking.getTrip().getDepartureTime()).append("\n");
        msg.append("🛑 *Boarding Point*: ").append(booking.getPickupLocation()).append(" at ").append(booking.getPickupTime()).append("\n");
        msg.append("🏁 *Dropping Point*: ").append(booking.getDropLocation()).append(" at ").append(booking.getDropTime()).append("\n");
        msg.append("💺 *Seat(s)*: ").append(seatNumbers).append("\n");
        msg.append("💰 *Total Fare*: Rs. ").append(booking.getTotalFare().toString()).append("\n\n");
        msg.append("🔗 *Digital Ticket*: http://localhost:3000/booking/").append(booking.getBookingReference()).append("\n\n");
        msg.append("Thank you for choosing Rajni Bus Service! Have a safe and pleasant journey. 🌟\n");
        msg.append("--------------------------------------------------\n");
        msg.append("==================================================");

        // Print to application logs for developer simulation
        System.out.println(msg.toString());

        // Note: For real Twilio / Meta API integration, you would add:
        /*
        try {
            // Example Twilio API:
            // Message.creator(
            //     new PhoneNumber("whatsapp:" + phone),
            //     new PhoneNumber("whatsapp:" + twilioWhatsAppSandboxNumber),
            //     msg.toString()
            // ).create();
        } catch (Exception e) {
            System.err.println("Failed to send real WhatsApp message: " + e.getMessage());
        }
        */
    }
}
