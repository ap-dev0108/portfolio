export async function sendContact(values: {
    name: string;
    email: string;
    phone: string;
    eventType: string;
    eventDate: string;
    message: string;
}) {
    const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
            access_key: import.meta.env.FORM_ACCESS_KEY,
            subject: `New enquiry from ${values.name}`,
            name: values.name,
            email: values.email,
            phone: values.phone || "Not provided",
            event_type: values.eventType,
            event_date: values.eventDate || "Not provided",
            message: values.message,
        }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to send");
    }
}
