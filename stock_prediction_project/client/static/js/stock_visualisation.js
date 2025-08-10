document.addEventListener('DOMContentLoaded', function () {
    particlesJS("particles", {
        particles: {
            number: {
                value: 100,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: "#ffffff"
            },
            shape: {
                type: "circle",
                stroke: {
                    width: 0,
                    color: "#000000"
                }
            },
            opacity: {
                value: 0.8,
                random: true,
                animation: {
                    enable: true,
                    speed: 1,
                    opacity_min: 0,
                    sync: false
                }
            },
            size: {
                value: 3,
                random: true
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: "#ffffff",
                opacity: 0.4,
                width: 1
            },
            move: {
                enable: true,
                speed: 2,
                direction: "none",
                random: true,
                straight: false,
                out_mode: "out",
                bounce: false,
            }
        },
        interactivity: {
            detectsOn: "canvas",
            events: {
                onHover: {
                    enable: true,
                    mode: "push"
                },
                onClick: {
                    enable: true,
                    mode: "push"
                },
                resize: true
            },
            modes: {
                repulse: {
                    distance: 100,
                    duration: 0.4
                },
                push: {
                    particles_nb: 4
                }
            }
        },
        retina_detect: true
    });

});


document.addEventListener('DOMContentLoaded', function () {
    const submit_single_company = document.getElementById("submit_single_company");
    const company_name_1 = document.getElementById("company_name_1");

    if (submit_single_company && company_name_1) {
        submit_single_company.addEventListener("click", function (event) {
            event.preventDefault(); // Prevent the default form submission behavior
            company_name = company_name_1.value;
            if (company_name == "") {
                alert("Please enter a company name");
                return;
            }
            fetch("/get_stock_ticker", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ company_name: company_name }),
            })
                .then(response => response.json())
                .then(data => {
                    console.log("Data:", data);
                    if (data.message && data.message !== "invalid") {
                        console.log("Stock ticker:", data.message);
                        display_graph(data.message);
                    } else {
                        alert("Invalid company name or company not found");
                    }
                })
                .catch(error => {
                    console.error("Error fetching stock ticker:", error);
                    alert("An error occurred while fetching the stock ticker");
                });
            // display_graph(company_name_1.value);
        });
    } else {
        console.error("Submit button or company name input not found");
    }
});

function display_graph(graph_name) {
    const widgetConfig = {
        symbol: "NASDAQ:" + graph_name,
        interval: "D",
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "en",
        allow_symbol_change: true,
        calendar: false,
        support_host: "https://www.tradingview.com",
    };

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.innerHTML = JSON.stringify(widgetConfig);

    const targetDiv = document.getElementById("graph");
    if (targetDiv) {
        // Clear the previous graph
        targetDiv.innerHTML = '';
        targetDiv.appendChild(script);
    } else {
        console.error("Target div not found");
    }
}

document.addEventListener('DOMContentLoaded', function () {
const submit_single_company = document.getElementById("submit_single_company");
const company_name_1 = document.getElementById("company_name_1");

if (submit_single_company && company_name_1) {
    submit_single_company.addEventListener("click", function (event) {
        event.preventDefault(); // Prevent the default form submission behavior
        company_name = company_name_1.value;
        if (company_name == "") {
            alert("Please enter a company name");
            return;
        }
        fetch("/get_stock_ticker", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ company_name: company_name }),
        })
            .then(response => response.json())
            .then(data => {
                console.log("Data:", data);
                if (data.message && data.message !== "invalid") {
                    console.log("Stock ticker:", data.message);
                    display_graph(data.message);
                } else {
                    alert("Invalid company name or company not found");
                }
            })
            .catch(error => {
                console.error("Error fetching stock ticker:", error);
                alert("An error occurred while fetching the stock ticker");
            });
        // display_graph(company_name_1.value);
    });
} else {
    console.error("Submit button or company name input not found");
}

function display_graph(graph_name) {
    const widgetConfig = {
        symbol: "NASDAQ:" + graph_name,
        interval: "D",
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "en",
        allow_symbol_change: true,
        calendar: false,
        support_host: "https://www.tradingview.com",
    };

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.innerHTML = JSON.stringify(widgetConfig);

    const targetDiv = document.getElementById("graph");
    if (targetDiv) {
        // Clear the previous graph
        targetDiv.innerHTML = '';
        targetDiv.appendChild(script);
    } else {
        console.error("Target div not found");
    }
}


});