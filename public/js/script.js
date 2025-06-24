$(document).ready(function () {
  $('#year').text(new Date().getFullYear());

  const projects = [
    {
      title: "QR code component",
      images: ["assets/images/portfolio1.png", "assets/images/portfolio2.png"],
      skills: ["HTML", "Bootstrap"],
      link: "https://khazin.github.io/qr-code-component/"
    },
    {
      title: "Order summary component",
      images: ["assets/images/todo1.png", "assets/images/todo2.png"],
      skills: ["HTML", "CSS"],
      link: "https://khazin.github.io/Order-summary-component/"
    },
    {
      title: "IP Address Tracker",
      images: ["assets/images/blog1.png", "assets/images/blog2.png"],
      skills: ["HTML", "CSS", "Javascript"],
      link: "https://khazin.github.io/IP-Address-Tracker/"
    }
  ];

  projects.forEach((project, index) => {
    let carouselId = `carousel${index}`;
    let carouselIndicators = '';
    let carouselItems = '';

    project.images.forEach((img, i) => {
      carouselIndicators += `
        <button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${i}" class="${i === 0 ? 'active' : ''}" aria-current="${i === 0 ? 'true' : ''}" aria-label="Slide ${i + 1}"></button>
      `;
      carouselItems += `
        <div class="carousel-item ${i === 0 ? 'active' : ''}">
          <img src="${img}" class="d-block w-100" alt="Project image ${i + 1}" />
        </div>
      `;
    });

    let hashtags = project.skills.map(skill => `<span class="badge bg-secondary me-1">#${skill}</span>`).join(" ");

    $('#projectList').append(`
      <div class="col-md-4 mb-4">
        <div class="card shadow-sm h-100">
          <div id="${carouselId}" class="carousel slide" data-bs-ride="carousel">
            <div class="carousel-indicators">
              ${carouselIndicators}
            </div>
            <div class="carousel-inner">
              ${carouselItems}
            </div>
            <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
              <span class="carousel-control-prev-icon"></span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
              <span class="carousel-control-next-icon"></span>
            </button>
          </div>
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${project.title}</h5>
            <p>${hashtags}</p>
            <a href="${project.link}" class="btn btn-outline-primary mt-auto" target="_blank">View Project</a>
          </div>
        </div>
      </div>
    `);
  });
});

$('#resumeForm').on('submit', async function (e) {
  e.preventDefault();

  const fileInput = $('#resumeFile')[0];
  const file = fileInput.files[0];

  if (!file) return alert("Please select a file.");

  const formData = new FormData();
  formData.append('resume', file);

  $('#resumeResult').addClass('d-none');
  $('#parsedOutput').text("Parsing...");

  try {
    const res = await fetch('/api/parse-resume', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();

    if (!res.ok) {
      $('#parsedOutput').text(data.error || 'Something went wrong.');
    } else {
      $('#parsedOutput').text(JSON.stringify(data, null, 2));
    }

    $('#resumeResult').removeClass('d-none');
  } catch (err) {
    $('#parsedOutput').text('Error: ' + err.message);
    $('#resumeResult').removeClass('d-none');
  }
});

