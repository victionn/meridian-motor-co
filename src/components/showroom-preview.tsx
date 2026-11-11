import Link from "next/link";
import { getLatestVehicles } from "@/lib/inventory";
import { Carousel } from "./carousel";
import { VehicleCard } from "./vehicle-card";

/** Home page: the newest cars in stock as a sideways-scrolling row, with a link through to the full showroom. */
export async function ShowroomPreview() {
  const vehicles = (await getLatestVehicles(8)).filter((v) => v.status !== "sold");
  if (vehicles.length === 0) return null;

  return (
    <section className="bg-paper text-ink [color-scheme:light]">
      <div className="edge-x pt-16 sm:pt-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <h2 className="heading">From the showroom</h2>
          <Link href="/cars" className="text-sm text-ink underline-offset-4 hover:underline">
            View all cars →
          </Link>
        </div>

        <Carousel label="Latest cars in the showroom">
          {vehicles.map((v) => (
            <li key={v.id} className="w-[85%] shrink-0 snap-center sm:w-104 lg:w-[calc((100%-5rem)/2.5)] min-[112.5rem]:w-[calc((100%-7.5rem)/3.5)]">
              <div className="h-full [&>article]:h-full">
                <VehicleCard vehicle={v} />
              </div>
            </li>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
