import { brand } from "@/config/brand";
import * as inkqubo from "./inkqubo";
import * as meridian from "./seed";

/** Starter content for the active brand, used when no database is connected. */
export const starter = brand.key === "inkqubo" ? inkqubo : meridian;
