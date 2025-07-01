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
  type: z.literal("chartjs"),
  chart: z.object({
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
  }),
});

// QR Code configuration
const qrConfig = z.object({
  type: z.literal("qr"),
  text: z.string(),
  margin: z.number().optional(),
  ecLevel: z.enum(["L", "M", "Q", "H"]).optional(),
  dark: z.string().optional(),
  light: z.string().optional(),
  size: z.number().optional(),
});

// Graphviz configuration
const graphvizConfig = z.object({
  type: z.literal("graphviz"),
  graph: z.string(),
  engine: z.enum(["dot", "neato", "circo", "fdp", "twopi", "osage", "patchwork"]).optional(),
  format: z.enum(["png", "svg"]).optional(),
});

// Sparkline configuration
const sparklineConfig = z.object({
  type: z.literal("sparkline"),
  data: z.array(z.number()),
  width: z.number().optional(),
  height: z.number().optional(),
  lineColor: z.string().optional(),
  fillColor: z.string().optional(),
  chartRangeMin: z.number().optional(),
  chartRangeMax: z.number().optional(),
  spotColor: z.string().optional(),
  minSpotColor: z.string().optional(),
  maxSpotColor: z.string().optional(),
  highlightSpotColor: z.string().optional(),
  highlightLineColor: z.string().optional(),
  lineWidth: z.number().optional(),
  spotRadius: z.number().optional(),
  disableHiddenCheck: z.boolean().optional(),
});

// Apex Charts configuration
const apexConfig = z.object({
  type: z.literal("apex"),
  config: z.object({
    chart: z.object({
      type: z.enum([
        "line",
        "area",
        "bar",
        "column",
        "pie",
        "donut",
        "radialBar",
        "scatter",
        "bubble",
        "heatmap",
        "treemap",
        "boxPlot",
        "candlestick",
        "radar",
        "polarArea",
        "rangeBar",
      ]),
      height: z.number().optional(),
      width: z.union([z.number(), z.string()]).optional(),
      toolbar: z.object({
        show: z.boolean().optional(),
      }).optional(),
      animations: z.object({
        enabled: z.boolean().optional(),
      }).optional(),
      background: z.string().optional(),
    }),
    series: z.array(
      z.union([
        // For most chart types
        z.object({
          name: z.string().optional(),
          data: z.array(
            z.union([
              z.number(),
              z.object({
                x: z.union([z.string(), z.number()]),
                y: z.union([z.number(), z.array(z.number())]).optional(),
                z: z.number().optional(),
              }),
            ])
          ),
        }),
        // For pie/donut charts (simple number array)
        z.number(),
      ])
    ),
    xaxis: z.object({
      categories: z.array(z.union([z.string(), z.number()])).optional(),
      type: z.enum(["category", "datetime", "numeric"]).optional(),
      labels: z.object({
        show: z.boolean().optional(),
        rotate: z.number().optional(),
        style: z.object({
          colors: z.union([z.string(), z.array(z.string())]).optional(),
          fontSize: z.string().optional(),
        }).optional(),
      }).optional(),
      title: z.object({
        text: z.string().optional(),
      }).optional(),
    }).optional(),
    yaxis: z.object({
      title: z.object({
        text: z.string().optional(),
      }).optional(),
      labels: z.object({
        show: z.boolean().optional(),
        formatter: z.string().optional(),
      }).optional(),
      min: z.number().optional(),
      max: z.number().optional(),
    }).optional(),
    colors: z.array(z.string()).optional(),
    labels: z.array(z.string()).optional(),
    legend: z.object({
      show: z.boolean().optional(),
      position: z.enum(["top", "bottom", "left", "right"]).optional(),
    }).optional(),
    title: z.object({
      text: z.string().optional(),
      align: z.enum(["left", "center", "right"]).optional(),
    }).optional(),
    subtitle: z.object({
      text: z.string().optional(),
      align: z.enum(["left", "center", "right"]).optional(),
    }).optional(),
    dataLabels: z.object({
      enabled: z.boolean().optional(),
    }).optional(),
    plotOptions: z.object({
      bar: z.object({
        horizontal: z.boolean().optional(),
        columnWidth: z.string().optional(),
        barHeight: z.string().optional(),
      }).optional(),
      pie: z.object({
        donut: z.object({
          size: z.string().optional(),
          labels: z.object({
            show: z.boolean().optional(),
          }).optional(),
        }).optional(),
      }).optional(),
    }).optional(),
    grid: z.object({
      show: z.boolean().optional(),
      borderColor: z.string().optional(),
    }).optional(),
    stroke: z.object({
      curve: z.enum(["smooth", "straight", "stepline"]).optional(),
      width: z.union([z.number(), z.array(z.number())]).optional(),
    }).optional(),
    markers: z.object({
      size: z.number().optional(),
    }).optional(),
  }).passthrough(),
});

// Table configuration
const tableConfig = z.object({
  type: z.literal("table"),
  data: z.object({
    headers: z.array(z.string()),
    rows: z.array(z.array(z.union([z.string(), z.number(), z.boolean(), z.null()]))),
  }),
  options: z.object({
    theme: z.enum(["default", "dark", "green", "red", "blue", "orange"]).optional(),
    showHeaders: z.boolean().optional(),
    alternateRows: z.boolean().optional(),
    fontSize: z.number().optional(),
    cellPadding: z.number().optional(),
    borderWidth: z.number().optional(),
    borderColor: z.string().optional(),
    headerBackgroundColor: z.string().optional(),
    headerFontColor: z.string().optional(),
    rowBackgroundColor: z.string().optional(),
    alternateRowBackgroundColor: z.string().optional(),
    fontColor: z.string().optional(),
  }).optional(),
});

// Progress Bar configuration (uses /chart endpoint)
const progressBarConfig = z.object({
  type: z.literal("progressBar"),
  data: z.object({
    datasets: z.array(
      z.object({
        data: z.array(z.number()),
        backgroundColor: z.string().optional(),
        borderColor: z.string().optional(),
      }),
    ),
  }),
});

// Radial Gauge configuration (uses /chart endpoint)
const radialGaugeConfig = z.object({
  type: z.literal("radialGauge"),
  data: z.object({
    datasets: z.array(
      z.object({
        data: z.array(z.number()),
        backgroundColor: z.union([z.string(), z.array(z.string())]).optional(),
        borderWidth: z.number().optional(),
        borderColor: z.string().optional(),
      }),
    ),
  }),
  options: z.object({
    trackColor: z.string().optional(),
    centerPercentage: z.number().optional(),
    roundedCorners: z.boolean().optional(),
    centerArea: z.object({
      text: z.string().optional(),
      fontSize: z.number().optional(),
      fontColor: z.string().optional(),
    }).optional(),
  }).optional(),
});

// Combined schema
const configSchema = z.discriminatedUnion("type", [
  chartJsConfig,
  qrConfig,
  graphvizConfig,
  sparklineConfig,
  apexConfig,
  tableConfig,
  progressBarConfig,
  radialGaugeConfig,
]);

export const quickChartTool = tool({
  description:
    "Generate charts (Chart.js, Apex), QR codes, graphs (Graphviz), sparklines, tables, progress bars, and radial gauges using QuickChart API",
  parameters: z.object({
    config: configSchema,
    width: z.number().optional().describe("Width in pixels"),
    height: z.number().optional().describe("Height in pixels"),
    backgroundColor: z.string().optional().describe("Background color"),
    devicePixelRatio: z.number().optional().describe("Resolution (1-3)"),
    format: z.enum(["png", "webp", "svg", "pdf"]).optional().describe("Output format"),
  }),
  execute: async ({
    config,
    width,
    height,
    backgroundColor,
    devicePixelRatio,
    format,
  }) => {
    let endpoint: string;
    let chartConfig: unknown;
    const params = new URLSearchParams();

    // Determine endpoint and configuration based on type
    switch (config.type) {
      case "chartjs":
        endpoint = "chart";
        chartConfig = config.chart;
        break;
      
      case "qr":
        endpoint = "qr";
        params.append("text", config.text);
        if (config.margin !== undefined) params.append("margin", config.margin.toString());
        if (config.ecLevel) params.append("ecLevel", config.ecLevel);
        if (config.dark) params.append("dark", config.dark);
        if (config.light) params.append("light", config.light);
        if (config.size) params.append("size", config.size.toString());
        break;
      
      case "graphviz":
        endpoint = "graphviz";
        params.append("graph", config.graph);
        if (config.engine) params.append("engine", config.engine);
        if (config.format) params.append("format", config.format);
        break;
      
      case "sparkline":
        endpoint = "sparkline";
        params.append("data", config.data.join(","));
        if (config.width) params.append("width", config.width.toString());
        if (config.height) params.append("height", config.height.toString());
        if (config.lineColor) params.append("lineColor", config.lineColor);
        if (config.fillColor) params.append("fillColor", config.fillColor);
        if (config.chartRangeMin !== undefined) params.append("chartRangeMin", config.chartRangeMin.toString());
        if (config.chartRangeMax !== undefined) params.append("chartRangeMax", config.chartRangeMax.toString());
        if (config.spotColor) params.append("spotColor", config.spotColor);
        if (config.minSpotColor) params.append("minSpotColor", config.minSpotColor);
        if (config.maxSpotColor) params.append("maxSpotColor", config.maxSpotColor);
        if (config.highlightSpotColor) params.append("highlightSpotColor", config.highlightSpotColor);
        if (config.highlightLineColor) params.append("highlightLineColor", config.highlightLineColor);
        if (config.lineWidth !== undefined) params.append("lineWidth", config.lineWidth.toString());
        if (config.spotRadius !== undefined) params.append("spotRadius", config.spotRadius.toString());
        break;
      
      case "apex":
        endpoint = "apex";
        params.append("config", JSON.stringify(config.config));
        break;
      
      case "table":
        endpoint = "table";
        params.append("data", JSON.stringify(config.data));
        if (config.options) params.append("options", JSON.stringify(config.options));
        break;
      
      case "progressBar":
        endpoint = "chart";
        chartConfig = {
          type: "progressBar",
          data: config.data,
        };
        break;
      
      case "radialGauge":
        endpoint = "chart";
        chartConfig = {
          type: "radialGauge",
          data: config.data,
          options: config.options,
        };
        break;
    }

    // Add chart config for chart-based endpoints
    if (chartConfig) {
      params.append("c", JSON.stringify(chartConfig));
    }

    // Add common parameters (not for all endpoints)
    if (width && !["sparkline"].includes(config.type)) {
      params.append("width", width.toString());
    }
    if (height && !["sparkline"].includes(config.type)) {
      params.append("height", height.toString());
    }
    if (backgroundColor && !["qr", "sparkline", "table"].includes(config.type)) {
      params.append("backgroundColor", backgroundColor);
    }
    if (devicePixelRatio && ["chartjs", "apex", "progressBar", "radialGauge"].includes(config.type)) {
      params.append("devicePixelRatio", devicePixelRatio.toString());
    }
    if (format && !["sparkline", "graphviz"].includes(config.type)) {
      params.append("format", format);
    }

    return `https://quickchart.io/${endpoint}?${params.toString()}`;
  },
});