export async function getMe(apiKey: string) {
  const response = await fetch(`https://api.cal.com/v2/me`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "cal-api-version": "2024-09-04",
    },
  });

  return response;
}

export async function getEventTypes(apiKey: string) {
  const response = await fetch(`https://api.cal.com/v2/event-types`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "cal-api-version": "2024-04-16",
    },
  });

  return response;
}

export async function getSlots(
  apiKey: string,
  start: string,
  end: string,
  eventTypeId: number,
  timeZone: string
) {
  const urlParams = new URLSearchParams({
    start,
    end,
    eventTypeId: eventTypeId.toString(),
    timeZone,
  });
  const response = await fetch(
    `https://api.cal.com/v2/slots?${urlParams.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "cal-api-version": "2024-09-04",
      },
    }
  );

  return response;
}

export async function createBooking(
  apiKey: string,
  eventTypeId: number,
  start: string,
  name: string,
  email: string,
  timeZone: string
) {
  const response = await fetch(`https://api.cal.com/v2/bookings`, {
    method: "POST",
    body: JSON.stringify({
      eventTypeId,
      start,
      attendee: {
        name,
        timeZone,
        email,
      },
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "cal-api-version": "2024-08-13",
    },
  });

  return response;
}
