import AddIcon from "@mui/icons-material/Add";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";

export const navList = [
  {
    nav: "Dashboard",
    path: "/",
    logo: DashboardIcon,
  },
  {
    nav: "Income Entry",
    path: "/income-entry",
    logo: AccountBalanceIcon,
  },
  {
    nav: "Expenditure Entry",
    path: "/expense-entry",
    logo: MoneyOffIcon,
  },
];