import { tool } from "ai";
import { z } from "zod/v3";

// Dataset schema for Chart.js
const datasetSchema = z
  .object({
    label: z.string().optional(),
    data: z.array(
      z.union([
        z.number(),
        z.null(),
        z.object({
          x: z.union([z.number(), z.string()]),
          y: z.number(),
          r: z.number().optional(),
        }),
      ]),
    ),
    backgroundColor: z.union([z.string(), z.array(z.string())]).optional(),
    borderColor: z.union([z.string(), z.array(z.string())]).optional(),
    borderWidth: z.number().optional(),
    fill: z.union([z.boolean(), z.string()]).optional(),
    tension: z.number().optional(),
    pointRadius: z.number().optional(),
    pointStyle: z.string().optional(),
    borderDash: z.array(z.number()).optional(),
    hidden: z.boolean().optional(),
    stack: z.string().optional(),
    yAxisID: z.string().optional(),
    xAxisID: z.string().optional(),
  })
  .passthrough(); // Allow additional Chart.js properties

// Chart.js configuration
const chartJsConfig = z.object({
  type: z.enum([
    "bar",
    "line",
    "pie",
    "doughnut",
    "radar",
    "polarArea",
    "bubble",
    "scatter",
    "horizontalBar",
  ]),
  data: z.object({
    labels: z.array(z.string()).optional(),
    datasets: z.array(datasetSchema),
  }),
  options: z
    .object({
      responsive: z.boolean().optional(),
      maintainAspectRatio: z.boolean().optional(),
      title: z
        .object({
          display: z.boolean().optional(),
          text: z.union([z.string(), z.array(z.string())]).optional(),
          fontSize: z.number().optional(),
          fontColor: z.string().optional(),
        })
        .optional(),
      legend: z
        .object({
          display: z.boolean().optional(),
          position: z.enum(["top", "bottom", "left", "right"]).optional(),
          labels: z
            .object({
              fontSize: z.number().optional(),
              fontColor: z.string().optional(),
            })
            .optional(),
        })
        .optional(),
      scales: z
        .object({
          xAxes: z
            .array(
              z
                .object({
                  display: z.boolean().optional(),
                  scaleLabel: z
                    .object({
                      display: z.boolean().optional(),
                      labelString: z.string().optional(),
                    })
                    .optional(),
                  ticks: z
                    .object({
                      min: z.number().optional(),
                      max: z.number().optional(),
                      stepSize: z.number().optional(),
                      fontSize: z.number().optional(),
                    })
                    .passthrough()
                    .optional(),
                  gridLines: z
                    .object({
                      display: z.boolean().optional(),
                      color: z.string().optional(),
                    })
                    .optional(),
                  type: z
                    .enum(["linear", "logarithmic", "category", "time"])
                    .optional(),
                })
                .passthrough(),
            )
            .optional(),
          yAxes: z
            .array(
              z
                .object({
                  display: z.boolean().optional(),
                  scaleLabel: z
                    .object({
                      display: z.boolean().optional(),
                      labelString: z.string().optional(),
                    })
                    .optional(),
                  ticks: z
                    .object({
                      min: z.number().optional(),
                      max: z.number().optional(),
                      stepSize: z.number().optional(),
                      fontSize: z.number().optional(),
                      beginAtZero: z.boolean().optional(),
                    })
                    .passthrough()
                    .optional(),
                  gridLines: z
                    .object({
                      display: z.boolean().optional(),
                      color: z.string().optional(),
                    })
                    .optional(),
                  type: z.enum(["linear", "logarithmic"]).optional(),
                })
                .passthrough(),
            )
            .optional(),
        })
        .passthrough()
        .optional(),
      plugins: z
        .object({
          datalabels: z
            .object({
              display: z
                .union([z.boolean(), z.string(), z.function()])
                .optional(),
              color: z.string().optional(),
              font: z
                .object({
                  size: z.number().optional(),
                  weight: z.string().optional(),
                })
                .optional(),
              formatter: z.string().optional(), // QuickChart accepts string functions
              anchor: z.enum(["center", "start", "end"]).optional(),
              align: z
                .enum([
                  "center",
                  "start",
                  "end",
                  "right",
                  "left",
                  "top",
                  "bottom",
                ])
                .optional(),
            })
            .passthrough()
            .optional(),
          annotation: z
            .object({
              annotations: z.array(
                z
                  .object({
                    type: z.enum(["line", "box"]),
                    mode: z.enum(["horizontal", "vertical"]).optional(),
                    scaleID: z.string().optional(),
                    value: z.union([z.number(), z.string()]).optional(),
                    borderColor: z.string().optional(),
                    borderWidth: z.number().optional(),
                    label: z
                      .object({
                        enabled: z.boolean().optional(),
                        content: z.string().optional(),
                      })
                      .optional(),
                  })
                  .passthrough(),
              ),
            })
            .optional(),
          outlabels: z
            .object({
              text: z.string().optional(),
              color: z.string().optional(),
              stretch: z.number().optional(),
              font: z
                .object({
                  size: z.number().optional(),
                  weight: z.string().optional(),
                })
                .optional(),
            })
            .optional(),
          doughnutlabel: z
            .object({
              labels: z.array(
                z.object({
                  text: z.string(),
                  font: z
                    .object({
                      size: z.number().optional(),
                      weight: z.string().optional(),
                    })
                    .optional(),
                  color: z.string().optional(),
                }),
              ),
            })
            .optional(),
        })
        .passthrough()
        .optional(),
    })
    .passthrough()
    .optional(),
});

// Special QuickChart types
const qrConfig = z.object({
  type: z.literal("qr"),
  text: z.string(),
  margin: z.number().optional(),
  ecLevel: z.enum(["L", "M", "Q", "H"]).optional(),
  dark: z.string().optional(),
  light: z.string().optional(),
});

const graphvizConfig = z.object({
  type: z.literal("graphviz"),
  graph: z.string(),
  engine: z.enum(["dot", "neato", "circo", "fdp", "twopi"]).optional(),
});

const sparklineConfig = z.object({
  type: z.literal("sparkline"),
  data: z.array(z.number()),
  width: z.number().optional(),
  height: z.number().optional(),
  lineColor: z.string().optional(),
  fillColor: z.string().optional(),
});

const progressBarConfig = z.object({
  type: z.literal("progressBar"),
  data: z.object({
    datasets: z.array(
      z.object({
        data: z.array(z.number()),
      }),
    ),
  }),
});

const radialGaugeConfig = z.object({
  type: z.literal("radialGauge"),
  data: z.object({
    datasets: z.array(
      z.object({
        data: z.array(z.number()),
        backgroundColor: z.string().optional(),
      }),
    ),
  }),
});

// Combined schema
const configSchema = z.discriminatedUnion("type", [
  chartJsConfig,
  qrConfig,
  graphvizConfig,
  sparklineConfig,
  progressBarConfig,
  radialGaugeConfig,
]);

export const quickChartTool = tool({
  description:
    "Generate charts, QR codes, graphs, sparklines using QuickChart API",
  parameters: z.object({
    config: configSchema,
    width: z.number().optional().describe("Width in pixels"),
    height: z.number().optional().describe("Height in pixels"),
    backgroundColor: z.string().optional().describe("Background color"),
    devicePixelRatio: z.number().optional().describe("Resolution (1-3)"),
    format: z.enum(["png", "webp", "svg", "pdf"]).optional(),
  }),
  execute: async ({
    config,
    width,
    height,
    backgroundColor,
    devicePixelRatio,
    format,
  }) => {
    const params = new URLSearchParams({
      c: JSON.stringify(config),
    });

    if (width) params.append("width", width.toString());
    if (height) params.append("height", height.toString());
    if (backgroundColor) params.append("backgroundColor", backgroundColor);
    if (devicePixelRatio)
      params.append("devicePixelRatio", devicePixelRatio.toString());
    if (format) params.append("format", format);

    return `https://quickchart.io/chart?${params.toString()}`;
  },
});
