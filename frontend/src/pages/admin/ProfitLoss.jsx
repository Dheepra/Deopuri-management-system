import { useEffect, useState } from "react";
import { getProfitLoss } from "../../services/profitLoss";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function ProfitLoss() {

  const [report, setReport] = useState(null);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      const data = await getProfitLoss();
      setReport(data);
    } catch (err) {
      console.log(err);
      alert("Failed to load Profit & Loss Report");
    }
  };

  if (!report) {
    return (
      <div className="p-6 text-center text-lg">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-6">

      <h2 className="text-3xl font-bold mb-6">
        Profit & Loss Report
      </h2>

      {/* Summary Cards */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* Total Sales */}
        <div className="bg-green-100 rounded-xl shadow p-5">
          <h3 className="text-gray-600 font-semibold">
            Total Sales
          </h3>

          <p className="text-3xl font-bold text-green-700 mt-2">
            ₹ {report.totalSales}
          </p>
        </div>

        {/* Total Expense */}
        <div className="bg-red-100 rounded-xl shadow p-5">
          <h3 className="text-gray-600 font-semibold">
            Total Expense
          </h3>

          <p className="text-3xl font-bold text-red-700 mt-2">
            ₹ {report.totalExpense}
          </p>
        </div>

        {/* Profit / Loss */}
        <div
          className={`rounded-xl shadow p-5 ${
            report.status === "PROFIT"
              ? "bg-blue-100"
              : "bg-yellow-100"
          }`}
        >

          <h3 className="text-gray-600 font-semibold">
            {report.status === "PROFIT"
              ? "Net Profit"
              : "Net Loss"}
          </h3>

          <p
            className={`text-3xl font-bold mt-2 ${
              report.status === "PROFIT"
                ? "text-blue-700"
                : "text-yellow-700"
            }`}
          >
            ₹ {report.status === "PROFIT"
              ? report.netProfit
              : report.netLoss}
          </p>

        </div>

        {/* Status */}
        <div className="bg-white rounded-xl shadow p-5">

          <h3 className="text-gray-600 font-semibold">
            Status
          </h3>

          <p
            className={`text-3xl font-bold mt-2 ${
              report.status === "PROFIT"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {report.status}
          </p>

        </div>

      </div>

      {/* Expense Table Part-2 */}
      {/* Expense Breakdown */}

<div className="bg-white rounded-xl shadow p-6 mt-8">

  <h2 className="text-xl font-bold mb-5">
    Expense Breakdown
  </h2>


  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">


    <div className="bg-red-50 rounded-xl p-5">
      <h3 className="text-gray-600 font-semibold">
        Raw Material
      </h3>

      <p className="text-2xl font-bold text-red-600 mt-2">
        ₹ {report.rawMaterialExpense}
      </p>
    </div>



    <div className="bg-orange-50 rounded-xl p-5">
      <h3 className="text-gray-600 font-semibold">
        Manufacturing
      </h3>

      <p className="text-2xl font-bold text-orange-600 mt-2">
        ₹ {report.manufacturingExpense}
      </p>
    </div>



    <div className="bg-yellow-50 rounded-xl p-5">
      <h3 className="text-gray-600 font-semibold">
        Packaging
      </h3>

      <p className="text-2xl font-bold text-yellow-600 mt-2">
        ₹ {report.packagingExpense}
      </p>
    </div>



    <div className="bg-blue-50 rounded-xl p-5">
      <h3 className="text-gray-600 font-semibold">
        Delivery
      </h3>

      <p className="text-2xl font-bold text-blue-600 mt-2">
        ₹ {report.deliveryExpense}
      </p>
    </div>



    <div className="bg-purple-50 rounded-xl p-5">
      <h3 className="text-gray-600 font-semibold">
        Salary
      </h3>

      <p className="text-2xl font-bold text-purple-600 mt-2">
        ₹ {report.salaryExpense}
      </p>
    </div>



    <div className="bg-green-50 rounded-xl p-5">
      <h3 className="text-gray-600 font-semibold">
        Electricity
      </h3>

      <p className="text-2xl font-bold text-green-600 mt-2">
        ₹ {report.electricityExpense}
      </p>
    </div>



    <div className="bg-gray-100 rounded-xl p-5">
      <h3 className="text-gray-600 font-semibold">
        Rent
      </h3>

      <p className="text-2xl font-bold text-gray-700 mt-2">
        ₹ {report.rentExpense}
      </p>
    </div>



    <div className="bg-pink-50 rounded-xl p-5">
      <h3 className="text-gray-600 font-semibold">
        Other Expense
      </h3>

      <p className="text-2xl font-bold text-pink-600 mt-2">
        ₹ {report.otherExpense}
      </p>
    </div>


  </div>

</div>

{/* Expense Distribution */}

<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">


  {/* Pie Chart */}

  <div className="bg-white rounded-xl shadow p-6">

    <h2 className="text-xl font-bold mb-5">
      Expense Distribution
    </h2>


    <div className="h-80">

      <ResponsiveContainer width="100%" height="100%">

        <PieChart>

          <Pie
            data={[
              {
                name:"Raw Material",
                value: report.rawMaterialExpense
              },
              {
                name:"Manufacturing",
                value: report.manufacturingExpense
              },
              {
                name:"Packaging",
                value: report.packagingExpense
              },
              {
                name:"Delivery",
                value: report.deliveryExpense
              },
              {
                name:"Salary",
                value: report.salaryExpense
              },
              {
                name:"Electricity",
                value: report.electricityExpense
              },
              {
                name:"Rent",
                value: report.rentExpense
              },
              {
                name:"Other",
                value: report.otherExpense
              }
            ]}

            dataKey="value"

            nameKey="name"

            outerRadius={110}

            label
          >


          </Pie>


          <Tooltip/>

          <Legend/>


        </PieChart>


      </ResponsiveContainer>


    </div>


  </div>




  {/* Final Profit Loss Card */}

  <div className="bg-white rounded-xl shadow p-6">


    <h2 className="text-xl font-bold mb-5">
      Final Analysis
    </h2>



    <div
      className={`rounded-xl p-8 text-center ${
        report.status === "PROFIT"
        ? "bg-green-100"
        : "bg-red-100"
      }`}
    >


      <h3 className="text-gray-600 font-semibold">
        Current Status
      </h3>


      <p
       className={`text-4xl font-bold mt-3 ${
        report.status === "PROFIT"
        ? "text-green-700"
        : "text-red-700"
       }`}
      >

        {report.status}

      </p>



      <div className="mt-6">


        {
          report.status === "PROFIT"

          ?

          <>

          <p className="text-gray-600">
            Net Profit
          </p>

          <p className="text-3xl font-bold text-green-700">
            ₹ {report.netProfit}
          </p>

          </>


          :

          <>

          <p className="text-gray-600">
            Net Loss
          </p>

          <p className="text-3xl font-bold text-red-700">
            ₹ {report.netloss}
          </p>

          </>

        }


      </div>



    </div>


  </div>


</div>

    </div>
  );
}