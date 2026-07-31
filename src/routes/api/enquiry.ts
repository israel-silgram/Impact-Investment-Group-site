import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

/** One payload shape for all six enquiry routes; fields vary by route. */
const enquirySchema = z.object({
  route: z.enum(["waitlist", "team", "partner", "investor", "media", "support"]),
  routedTo: z.string().max(120).optional(),
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  organisation: z.string().trim().min(2).max(150),
  role: z.string().trim().min(1).max(120),
  message: z.string().trim().max(2000).optional(),
  slot: z.string().trim().max(120).optional(),
  ticketSize: z.string().trim().max(120).optional(),
  acknowledgement: z.boolean().optional(),
  holdings: z.string().trim().max(2000).optional(),
  entityType: z.string().trim().max(120).optional(),
  deadline: z.string().trim().max(120).optional(),
});

export const Route = createFileRoute("/api/enquiry")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: unknown;
        try {
          payload = await request.json();
        } catch {
          return Response.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
        }

        const parsed = enquirySchema.safeParse(payload);
        if (!parsed.success) {
          return Response.json(
            { ok: false, errors: parsed.error.flatten().fieldErrors },
            { status: 400 },
          );
        }

        // Stubbed: log routing metadata only, never the enquiry body.
        console.log("[enquiry]", {
          route: parsed.data.route,
          routedTo: parsed.data.routedTo,
          receivedAt: new Date().toISOString(),
        });

        return Response.json({ ok: true }, { status: 200 });
      },
    },
  },
});
