const slider = document.getElementById("emojiSlider");
const emoji = document.getElementById("emoji");

slider.addEventListener("input", function () {
  const value = slider.value;
  if (value >= 8) {
    emoji.textContent = "😢";
  } else if (value >= 6) {
    emoji.textContent = "😟";
  } else if (value >= 4) {
    emoji.textContent = "😐";
  } else if (value >= 2) {
    emoji.textContent = "🙂";
  } else {
    emoji.textContent = "😃";
  }
});

function getValues() {
  const experience = document.getElementById("experience").value;
  const timeHorizon = document.getElementById("timeHorizon").value;
  const incomeLevel = document.getElementById("incomeLevel").value;
  const investmentStrategy = document.getElementById("investmentStrategy").value;
  const riskFactor = document.getElementById("emojiSlider").value;
  if (
    experience == "Select Investment Experience" ||
    timeHorizon == "Select Investment time horizon" ||
    incomeLevel == "Select Income Level" ||
    investmentStrategy == "Select Investment Strategy"
  ) {
    alert("Please fill all the fields");
    return;
  }
  // console.log("Investment Experience:", experience);
  // console.log("Investment Time Horizon:", timeHorizon);
  // console.log("Income Level:", incomeLevel);
  // console.log("Investment Strategy:", investmentStrategy);
  // console.log("Risk Factor:", riskFactor);

  const data = {
    experience: experience,
    timeHorizon: timeHorizon,
    incomeLevel: incomeLevel,
    investmentStrategy: investmentStrategy,
    riskFactor: riskFactor,
  };
  console.log(data);

  fetch("/stock_recommendation_by_data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const stockRec = document.getElementById("chatParagraph");
      stockRec.innerText = data.response;
    });
}


//-----------------------------------------------------------------------

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