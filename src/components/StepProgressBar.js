// components/StepProgressBar.js
import React from "react";

const steps = ["注文内容", "配送先住所", "決済情報", "内容確認", "完了"];

const StepProgressBar = ({ currentStep }) => {
  return (
    <div style={styles.container}>
      {steps.map((label, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        const circleStyle = {
          ...styles.circle,
          backgroundColor: isCurrent
            ? "#2196f3"
            : isCompleted
            ? "#4caf50"
            : "#e0e0e0",
          color: isCurrent || isCompleted ? "#fff" : "#000",
        };

        const barStyle = {
          ...styles.bar,
          backgroundColor: isCompleted ? "#4caf50" : "#e0e0e0",
        };

        return (
          <div key={index} style={styles.stepItem}>
            <div style={circleStyle}>{index + 1}</div>
            <div style={styles.label}>{label}</div>
            {index < steps.length - 1 && <div style={barStyle}></div>}
          </div>
        );
      })}
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    margin: "20px 0",
    position: "relative",
  },
  stepItem: {
    position: "relative",
    flex: 1,
    textAlign: "center",
  },
  circle: {
    width: 30,
    height: 30,
    lineHeight: "30px",
    borderRadius: "50%",
    margin: "0 auto",
    fontWeight: "bold",
  },
  label: {
    fontSize: "0.85rem",
    marginTop: 5,
  },
  bar: {
    position: "absolute",
    top: 15,
    right: "-50%",
    width: "100%",
    height: 2,
    zIndex: -1,
  },
};

export default StepProgressBar;
