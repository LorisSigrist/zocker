import { z as m } from "@zod/mini";
import { z as f } from "zod/v4";

const miniSchema = m.object({
    name: m.string().check(
        m.minLength(15),
        m.maxLength(20)
    )
})

const fullSchema = f.object({
    name: f.string().min(15).max(20)
})

miniSchema.def.shape
fullSchema.def.shape