import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const enquirySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  organisation: z.string().min(1),
  audience: z.string().min(1),
  message: z.string().min(10),
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

        // Stub: no backend yet. Log and acknowledge.
        console.log("[enquiry]", {
          ...parsed.data,
          receivedAt: new Date().toISOString(),
        });

        return Response.json({ ok: true }, { status: 200 });
      },
    },
  },
});
