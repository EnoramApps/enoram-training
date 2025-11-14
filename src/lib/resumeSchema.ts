// lib/resumeSchema.ts
import { z } from "zod";

export const ResumeSchema = z.object({
    name: z.string().optional(),
    title: z.string().optional(),
    location: z.string().optional(),
    contactInfo: z.object({
        email: z.string().optional(),
        website: z.string().optional(),
        linkedin: z.string().optional(),
        twitter: z.string().optional(),
        github: z.string().optional(),
    }),
    workExperience: z
        .array(
            z.object({
                startYear: z.string().optional(),
                endYear: z.string().optional(),
                title: z.string().optional(),
                company: z.string().optional(),
                location: z.string().optional(),
                description: z.string().optional(),
            })
        )
        .optional()
        .default([]),
    education: z
        .array(
            z.object({
                startYear: z.string().optional(),
                endYear: z.string().optional(),
                degree: z.string().optional(),
                school: z.string().optional(),
                location: z.string().optional(),
            })
        )
        .optional()
        .default([]),
    skills: z.array(z.string()).optional().default([]),
});

export type Resume = z.infer<typeof ResumeSchema>;
