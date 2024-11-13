// /src/components/StockChart.js
import React from 'react';
import { VictoryChart, VictoryCandlestick, VictoryAxis, VictoryTheme, VictoryLabel } from 'victory';

const StockChart = ({ displayedData, currentCandle }) => (
  <VictoryChart
    theme={VictoryTheme.material}
    domainPadding={{ x: 25, y: 20 }}
    scale={{ x: 'time' }}
    width={1000}
    height={500}
    style={{ background: { fill: "#282c34" } }}
  >
    <VictoryLabel text="AAPL Stock Price" x={500} y={30} textAnchor="middle" style={{ fill: "#ffffff" }} />
    <VictoryAxis
      tickFormat={(t) => `${t.getMonth() + 1}/${t.getDate()}`}
      style={{
        axis: { stroke: "#FFFFFF" },
        tickLabels: { fill: "#FFFFFF" },
        grid: { stroke: "#444", strokeDasharray: "3, 3" },
      }}
    />
    <VictoryAxis
      dependentAxis
      style={{
        axis: { stroke: "#FFFFFF" },
        tickLabels: { fill: "#FFFFFF" },
        grid: { stroke: "#444", strokeDasharray: "3, 3" },
      }}
    />
    <VictoryCandlestick
      data={[...displayedData, currentCandle].filter(Boolean)}
      x="date"
      open="open"
      close="close"
      high="high"
      low="low"
      candleColors={{ positive: "#4caf50", negative: "#f44336" }}
    />
  </VictoryChart>
);

export default StockChart;
