'use client';

import { useState, useEffect } from 'react';
import { BASE_URL, INCOME, EXPENDITURE, SAVING } from '@/ENUM';
import "@/Styles/dashboard/Dashboard.css";
import { useAuthContext } from "@/Context/AuthContext";
import MonthlyExpenseChart from './ChartComponents/MonthlyChart';
import DailyChart from './ChartComponents/DailyChart';
const Dashboard = () => {

    const { user } = useAuthContext();

    const [totalIncome, setTotalIncome] = useState<number>(0);
    const [totalExp, setTotalExp] = useState<number>(0);
    const [balance, setBalance] = useState<number>(0);

    const [optionValue, setOptionValue] = useState<string>("income");

    // 🔥 Separate year for Monthly Chart
    const [monthlyYear, setMonthlyYear] = useState<number>(new Date().getFullYear());

    const [monthlyData, setMonthlyData] = useState<any[]>([]);
    const [dailyData, setDailyData] = useState<any[]>([]);
    const [dailyMonth, setDailyMonth] = useState<number>(new Date().getMonth() + 1);

    // 🔥 Year list (Reusable)
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from(
        { length: currentYear - 1999 },
        (_, i) => currentYear - i
    );

    const monthOptions = [
        { value: 1, label: 'Jan' },
        { value: 2, label: 'Feb' },
        { value: 3, label: 'Mar' },
        { value: 4, label: 'Apr' },
        { value: 5, label: 'May' },
        { value: 6, label: 'Jun' },
        { value: 7, label: 'Jul' },
        { value: 8, label: 'Aug' },
        { value: 9, label: 'Sep' },
        { value: 10, label: 'Oct' },
        { value: 11, label: 'Nov' },
        { value: 12, label: 'Dec' },
    ];

    const endpointMap: any = {
        income: 'each-month-income',
        exp: 'each-month-expenditure',
        saving: 'each-month-saving'
    };

    const dailyEndpointMap: any = {
        income: 'each-day-income',
        exp: 'each-day-expenditure',
    };

    // ================================
    // 📊 TOTAL DATA
    // ================================
    useEffect(() => {
        if (!user) return;
        fetchTotalIncome();
        fetchTotalExp();
        fetchTotalSaving();
    }, [user]);

    // ================================
    // 📈 MONTHLY DATA
    // ================================
    useEffect(() => {
        if (!user) return;
        fetchMonthlyData();
    }, [user, monthlyYear, optionValue]);

    useEffect(() => {
        if (!user) return;
        if (optionValue === 'income' || optionValue === 'exp') {
            fetchDailyData();
        } else {
            setDailyData([]);
        }
    }, [user, optionValue, monthlyYear, dailyMonth]);

    const fetchMonthlyData = async () => {
        try {
            const res = await fetch(
                `${BASE_URL}/${optionValue}/${endpointMap[optionValue]}?user_id=${user?.id}&year=${monthlyYear}`
            );

            const data = await res.json();
            console.log("Monthly Data Response:", data);

            if (data?.code === 200) {
                setMonthlyData(data?.data || []);
            } else {
                setMonthlyData([]);
            }

        } catch (err) {
            console.log(err);
            setMonthlyData([]);
        }
    };

    const fetchDailyData = async () => {
        try {
            const res = await fetch(
                `${BASE_URL}/${optionValue}/${dailyEndpointMap[optionValue]}?user_id=${user?.id}&year=${monthlyYear}&month=${dailyMonth}`
            );
            const data = await res.json();
            console.log('Daily Data Response:', data);
            if (data?.code === 200) {
                setDailyData(data?.data || []);
            } else {
                setDailyData([]);
            }
        } catch (err) {
            console.log(err);
            setDailyData([]);
        }
    };

    const fetchTotalIncome = async () => {
        const res = await fetch(`${BASE_URL}${INCOME}/total-income?user_id=${user?.id}`);
        const data = await res.json();
        if (data?.code === 200) setTotalIncome(data?.total || 0);
    };

    const fetchTotalExp = async () => {
        const res = await fetch(`${BASE_URL}${EXPENDITURE}/total-expenditure?user_id=${user?.id}`);
        const data = await res.json();
        if (data?.code === 200) setTotalExp(data?.total || 0);
    };

    const fetchTotalSaving = async () => {
        const res = await fetch(`${BASE_URL}${SAVING}/total-savings?user_id=${user?.id}`);
        const data = await res.json();
        if (data?.code === 200) setBalance(data?.total_saving || 0);
    };

    // 🔥 Fix: ensure correct mapping (IMPORTANT)
    const formattedChartData = monthlyData.map((item: any) => ({
        month: item.month,
        amount: item.amount   // must match backend key
    }));

    return (
        <div className="dashboard-container">

            {/* ================= TOP CARDS ================= */}
            <div className="dashboard-card-container">
                <div className="dashboard-card total-income">
                    <p className="card-heading">Total Income</p>
                    <p className="card-amt">₹ {totalIncome}</p>
                </div>

                <div className="dashboard-card total-expense">
                    <p className="card-heading">Total Expenditure</p>
                    <p className="card-amt">₹ {totalExp}</p>
                </div>

                <div className="dashboard-card total-balance">
                    <p className="card-heading">Total Balance</p>
                    <p className="card-amt">₹ {balance}</p>
                </div>
            </div>

            {/* ================= FILTERS ================= */}
            <div className="variant-selector-container">
                <div className="variant-selector">
                    <label htmlFor="dashboard-type-select" className="selector-label">
                        Report Type
                    </label>
                    <select
                        id="dashboard-type-select"
                        value={optionValue}
                        onChange={(e) => setOptionValue(e.target.value)}
                    >
                        <option value="income">Income</option>
                        <option value="exp">Expenditure</option>
                        <option value="saving">Saving</option>
                    </select>
                </div>
            </div>

            {/* ================= CHART ================= */}
            <div className="chart-card">
                <div className="chart-card-header">
                    <div className="chart-card-title">
                        <h2>
                            {optionValue === "income"
                                ? "Monthly Income"
                                : optionValue === "exp"
                                ? "Monthly Expenditure"
                                : "Monthly Saving"}
                        </h2>
                        <p className="chart-subtitle">{monthlyYear} overview</p>
                    </div>

                    <div className="chart-year-selector">
                        <label htmlFor="monthly-year-select">Year</label>
                        <select
                            id="monthly-year-select"
                            value={monthlyYear}
                            onChange={(e) => setMonthlyYear(Number(e.target.value))}
                        >
                            {yearOptions.map((yr) => (
                                <option key={yr} value={yr}>
                                    {yr}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <MonthlyExpenseChart
                    data={formattedChartData}
                    title={
                        optionValue === "income"
                            ? "Monthly Income"
                            : optionValue === "exp"
                            ? "Monthly Expenditure"
                            : "Monthly Saving"
                    }
                />
            </div>

            {(optionValue === 'income' || optionValue === 'exp') && (
                <div className="chart-card">
                    <div className="chart-card-header">
                        <div className="chart-card-title">
                            <h2>
                                {optionValue === 'income'
                                    ? 'Daily Income'
                                    : 'Daily Expenditure'}
                            </h2>
                            <p className="chart-subtitle">
                                {monthlyYear} • {monthOptions.find((m) => m.value === dailyMonth)?.label}
                            </p>
                        </div>

                        <div className="chart-year-selector">
                            <label htmlFor="daily-month-select">Month</label>
                            <select
                                id="daily-month-select"
                                value={dailyMonth}
                                onChange={(e) => setDailyMonth(Number(e.target.value))}
                            >
                                {monthOptions.map((month) => (
                                    <option key={month.value} value={month.value}>
                                        {month.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <DailyChart
                        data={dailyData.map((item: any) => ({
                            day: item.day,
                            amount: item.amount,
                        }))}
                        title={
                            optionValue === 'income'
                                ? 'Daily Income'
                                : 'Daily Expenditure'
                        }
                    />
                </div>
            )}

        </div>
    );
};

export default Dashboard;