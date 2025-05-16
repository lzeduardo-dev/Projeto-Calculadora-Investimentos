import { generateReturnsArray } from "./InvestmentGoals.js";
import { Chart } from "chart.js/auto";
import { createTable } from "../src/table.js";

const finalMoneyChart = document.getElementById("final-money-distribution");
const progressionChart = document.getElementById("progression");
const calculateButton = document.getElementById("calculate-results");
const clearFormButton = document.getElementById("clearFormButton");

let doughnutChartReference = {};
let progressionChartReference = {};

const columnsArray = [
  {
    columnLabel: "Mês",
    accessor: "month",
    
  },
  {
    columnLabel: "Total Investido",
    accessor: "investedAmount",
    format: (numberInfo) => formatCurrency(numberInfo),
  },
  {
    columnLabel: "Rendimento mensal",
    accessor: "interestReturns",
    format: (numberInfo) => formatCurrency(numberInfo),
  },
  {
    columnLabel: "Rendimento Total",
    accessor: "totalInterestReturns",
    format: (numberInfo) => formatCurrency(numberInfo),
  },
  {
    columnLabel: "Quantia total",
    accessor: "totalAmount",
    format: (numberInfo) => formatCurrency(numberInfo),
  },
];

function formatCurrency(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function renderProgression(evt) {
  evt.preventDefault();
  if (document.querySelector("error")) {
    return;
  }

  resetCharts();

  const startingAmount = Number(
    document.getElementById("starting-amount").value
  );
  const additionalContribution = Number(
    document.getElementById("additional-contribution").value
  );
  const timeAmount = Number(document.getElementById("time-amount").value);
  const timeAmountPeriod = document.getElementById("time-amount-period").value;
  const returnRate = Number(document.getElementById("return-rate").value);
  const returnRatePeriod = document.getElementById("evaluation-period").value;
  const taxRate = Number(document.getElementById("tax-rate").value);

  const returnsArray = generateReturnsArray(
    startingAmount,
    timeAmount,
    timeAmountPeriod,
    additionalContribution,
    returnRate,
    returnRatePeriod
  );
  console.log(returnsArray[returnsArray.length - 1]);
  const finalInvestmentObject = returnsArray[returnsArray.length - 1];
  console.log(finalInvestmentObject);
  doughnutChartReference = new Chart(finalMoneyChart, {
    type: "doughnut",
    data: {
      labels: ["Valor Investido", "Rendimento", "Imposto"],
      datasets: [
        {
          data: [
            finalInvestmentObject.investedAmount,
            finalInvestmentObject.totalInterestReturns * (1 - taxRate / 100),
            finalInvestmentObject.totalInterestReturns * (taxRate / 100),
          ],
          backgroundColor: [
            "rgb(255, 99, 132)",
            "rgb(54, 162, 235)",
            "rgb(255, 205, 86)",
          ],
          hoverOffset: 4,
        },
      ],
    },
  });
  progressionChartReference = new Chart(progressionChart, {
    type: "bar",
    data: {
      labels: returnsArray.map((investmentObject) => investmentObject.month),
      datasets: [
        {
          label: "Total Investido",
          data: returnsArray.map(
            (investmentObject) => investmentObject.investedAmount
          ),
          backgroundColor: "rgb(255, 99, 132)",
        },
        {
          label: "Retorno do Investimento",
          data: returnsArray.map(
            (investmentObject) => investmentObject.interestReturns
          ),
          backgroundColor: "rgb(54, 162, 235)",
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
  createTable(columnsArray, returnsArray, "results-table");
}

function isObjectEmpty(obj) {
  return Object.keys(obj).length === 0;
}

function resetCharts() {
  if (!isObjectEmpty(doughnutChartReference)) {
    doughnutChartReference.destroy();
    doughnutChartReference = {};
  }
  if (!isObjectEmpty(progressionChartReference)) {
    progressionChartReference.destroy();
    progressionChartReference = {};
  }
}
function clearForm() {
  form["starting-amount"].value = "";
  form["additional-contribution"].value = "";
  form["time-amount"].value = "";
  form["return-rate"].value = "";
  form["tax-rate"].value = "";

  resetCharts();

  const errorInputContainers = document.querySelectorAll(".error");

  for (const errorInputContainer of errorInputContainers) {
    errorInputContainer.classList.remove("error");
    errorInputContainer.parentElement.querySelector("p").remove();
  }
}

function validadeInput(evt) {
  if (evt.target.value === "") {
    return;
  }
  const { parentElement } = evt.target;
  const grandParentElement = evt.target.parentElement.parentElement;
  const inputValue = evt.target.value.replace(",", ".");

  if (
    !parentElement.classList.contains("error") &&
    (isNaN(inputValue) || Number(inputValue) <= 0)
  ) {
    // objetivo: <p class="text-red-500"> Insira um valor numerico e maior que zero.</p>
    const errorTextElement = document.createElement("p"); //<p></p>
    errorTextElement.classList.add("text-red-500");
    errorTextElement.innerText = "insira um valor numérico e maior que zero";

    parentElement.classList.add("error");
    grandParentElement.appendChild(errorTextElement);
  } else if (
    parentElement.classList.contains("error") &&
    !isNaN(inputValue) &&
    Number(inputValue) > 0
  ) {
    parentElement.classList.remove("error");
    grandParentElement.querySelector("p").remove();
  }
}
const form = document.getElementById("form");

for (const formElement of form) {
  if (formElement.tagName === "INPUT" && formElement.hasAttribute("name")) {
    formElement.addEventListener("blur", validadeInput);
  }
}

calculateButton.addEventListener("click", renderProgression);
clearFormButton.addEventListener("click", clearForm);
