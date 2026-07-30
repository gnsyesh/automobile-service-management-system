import { VehicleMake } from "@/types";

export const vehicleMakes: VehicleMake[] = [
  {
    name: "Toyota",
    models: [
      {
        name: "Corolla",
        years: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
        engines: ["1.6L Dual VVT-i", "1.8L Hybrid", "2.0L Dynamic Force"]
      },
      {
        name: "Yaris",
        years: [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        engines: ["1.3L VVT-i", "1.5L VVT-i"]
      },
      {
        name: "RAV4",
        years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
        engines: ["2.0L VVT-i", "2.5L Hybrid"]
      },
      {
        name: "Fortuner",
        years: [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
        engines: ["2.7L 4-Cyl", "4.0L V6"]
      }
    ]
  },
  {
    name: "Hyundai",
    models: [
      {
        name: "Elantra CN7 / AD",
        years: [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
        engines: ["1.6L MPI", "1.6L Turbo T-GDI", "2.0L MPI"]
      },
      {
        name: "Tucson",
        years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
        engines: ["1.6L GDI", "1.6L Turbo Smartstream", "2.0L CRDi"]
      },
      {
        name: "Accent HC / RB",
        years: [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        engines: ["1.4L Kappa", "1.6L Gamma"]
      }
    ]
  },
  {
    name: "Nissan",
    models: [
      {
        name: "Sunny N17",
        years: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
        engines: ["1.5L HR15DE"]
      },
      {
        name: "Qashqai J11 / J12",
        years: [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
        engines: ["1.2L DIG-T", "1.3L DIG-T Turbo"]
      },
      {
        name: "Sentra B17",
        years: [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        engines: ["1.6L HR16DE"]
      }
    ]
  },
  {
    name: "Kia",
    models: [
      {
        name: "Cerato / Grand Cerato",
        years: [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
        engines: ["1.6L Gamma MPI", "1.6L T-GDI"]
      },
      {
        name: "Sportage",
        years: [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
        engines: ["1.6L GDI", "1.6L T-GDI Turbo"]
      }
    ]
  },
  {
    name: "BMW",
    models: [
      {
        name: "3 Series (F30 / G20)",
        years: [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
        engines: ["318i 1.5L Turbo", "320i 2.0L B48 Turbo", "330i 2.0L B48 Turbo"]
      },
      {
        name: "5 Series (G30)",
        years: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        engines: ["520i 2.0L Turbo", "530i 2.0L Turbo"]
      }
    ]
  },
  {
    name: "Mercedes-Benz",
    models: [
      {
        name: "C-Class (W205 / W206)",
        years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
        engines: ["C180 1.5L Turbo", "C200 1.5L Turbo Mild-Hybrid", "C300 2.0L Turbo"]
      },
      {
        name: "E-Class (W213)",
        years: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        engines: ["E200 2.0L Turbo", "E300 2.0L Turbo"]
      }
    ]
  },
  {
    name: "Fiat",
    models: [
      {
        name: "Tipo",
        years: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
        engines: ["1.4L E-Torq", "1.6L E-Torq Auto"]
      }
    ]
  },
  {
    name: "Skoda",
    models: [
      {
        name: "Octavia (A7 / A8)",
        years: [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
        engines: ["1.6L MPI", "1.4L TSI Turbo", "2.0L TSI RS"]
      }
    ]
  }
];
