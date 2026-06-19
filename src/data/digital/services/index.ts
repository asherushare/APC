import { DigitalService } from "@/types/service";
import { governmentServices } from "./government";
import { businessServices } from "./business";
import { aiServices } from "./ai";
import { creativeServices } from "./creative";
import { educationServices } from "./education";
import { agricultureServices } from "./agriculture";
import { communityServices } from "./community";
import { technologyServices } from "./technology";

export const getAllServices = (): DigitalService[] => {
  return [
    ...governmentServices,
    ...businessServices,
    ...aiServices,
    ...creativeServices,
    ...educationServices,
    ...agricultureServices,
    ...communityServices,
    ...technologyServices
  ];
};
