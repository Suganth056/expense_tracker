import { Pagination, Stack } from "@mui/material";

const PaginationComponent = ({data, count, page, setPage }: any) => {
    return (
        <Stack>
            {
                data.length > 0 && (
                    <Pagination
                        count={count}
                        page={page}
                        onChange={(_, value) => setPage(value)}
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            marginTop: "10px",
                            '& ul': {
                                flexWrap: 'nowrap',
                                backgroundColor: "#2c2c2c",
                                padding: "6px 10px",
                                borderRadius: "10px",
                                width: "max-content",
                                gap: "5px",
                            },

                            // 🔥 All items
                            '& .MuiPaginationItem-root': {
                                color: "#ffffff",
                                border: "1px solid #555",
                                margin: "0 2px",
                            },

                            // ✅ FIXED (correct selector)
                            '& .MuiPaginationItem-root.Mui-selected': {
                                backgroundColor: "#1976d2",
                                color: "#fff",
                                fontWeight: "bold",
                                border: "1px solid #1976d2",
                            },

                            // ✅ Hover
                            '& .MuiPaginationItem-root:hover': {
                                backgroundColor: "#444",
                            },

                            // ✅ Selected hover (optional polish)
                            '& .MuiPaginationItem-root.Mui-selected:hover': {
                                backgroundColor: "#1565c0",
                            },
                        }}
                    />
                )
            }

        </Stack>
    );
};

export default PaginationComponent;