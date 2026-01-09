// Carrossel de Projetos
class Carousel {
  constructor() {
    this.track = document.querySelector(".carousel-track");
    this.slides = document.querySelectorAll(".carousel-slide");
    this.prevBtn = document.querySelector(".prev-btn");
    this.nextBtn = document.querySelector(".next-btn");
    this.dotsContainer = document.querySelector(".carousel-dots");
    this.currentSlideElement = document.querySelector(".current-slide");
    this.totalSlidesElement = document.querySelector(".total-slides");

    if (!this.track || !this.slides.length) {
      console.error("Elementos do carrossel não encontrados!");
      return;
    }

    this.currentIndex = 0;
    this.totalSlides = this.slides.length;
    this.slideWidth = 0;
    this.cardsPerView = this.getCardsPerView();

    this.init();
  }

  getCardsPerView() {
    if (window.innerWidth < 768) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  }

  init() {
    console.log("Inicializando carrossel com", this.totalSlides, "slides");
    this.updateSlideWidth();
    this.createDots();
    this.updateCarousel();
    this.setupEventListeners();
    this.setupResizeHandler();

    // Atualiza o contador total
    this.totalSlidesElement.textContent = this.totalSlides;
  }

  updateSlideWidth() {
    if (this.slides.length > 0) {
      const slideStyle = window.getComputedStyle(this.slides[0]);
      const marginRight = parseInt(slideStyle.marginRight) || 0;
      this.slideWidth = this.slides[0].offsetWidth + marginRight;
      console.log("Largura do slide:", this.slideWidth);
    }
  }

  createDots() {
    this.dotsContainer.innerHTML = "";

    // SEMPRE 3 DOTS FIXOS
    const totalDots = 3;

    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement("div");
      dot.classList.add("dot");
      if (i === 0) dot.classList.add("active");

      // Calcula qual slide ir baseado no dot clicado
      dot.addEventListener("click", () => {
        // Divide os slides igualmente entre os 3 dots
        const slidesPerDot = Math.ceil(this.totalSlides / totalDots);
        const targetIndex = Math.min(
          i * slidesPerDot,
          this.totalSlides - this.cardsPerView
        );
        this.goToSlide(targetIndex);
      });

      this.dotsContainer.appendChild(dot);
    }

    this.totalDots = totalDots;
    console.log(
      `Criados ${totalDots} dots fixos para ${this.totalSlides} slides`
    );
  }

  updateCarousel() {
    // Atualiza posição do track
    const offset = -this.currentIndex * this.slideWidth;
    this.track.style.transform = `translateX(${offset}px)`;

    // Atualiza slides ativos
    this.slides.forEach((slide, index) => {
      slide.classList.toggle("active", index === this.currentIndex);
    });

    // Atualiza contador
    this.currentSlideElement.textContent = this.currentIndex + 1;

    // **CALCULA QUAL DOT DEVE ESTAR ATIVO (PARA 3 DOTS FIXOS)**
    let activeDotIndex = 0;

    if (this.totalSlides <= 3) {
      // Se tem 3 ou menos slides, cada dot representa um slide
      activeDotIndex = this.currentIndex;
    } else {
      // Para mais de 3 slides, divide em 3 grupos
      const maxIndex = Math.max(0, this.totalSlides - this.cardsPerView);
      const progress = this.currentIndex / maxIndex; // 0 a 1

      if (progress < 0.33) {
        activeDotIndex = 0; // Primeiro terço
      } else if (progress < 0.66) {
        activeDotIndex = 1; // Segundo terço
      } else {
        activeDotIndex = 2; // Terceiro terço
      }
    }

    // Atualiza dots
    document.querySelectorAll(".carousel-dots .dot").forEach((dot, index) => {
      dot.classList.toggle("active", index === activeDotIndex);
    });

    // Atualiza estado dos botões
    if (this.prevBtn) this.prevBtn.disabled = this.currentIndex === 0;
    if (this.nextBtn)
      this.nextBtn.disabled =
        this.currentIndex >= this.totalSlides - this.cardsPerView;
  }

  goToSlide(index) {
    const maxIndex = Math.max(0, this.totalSlides - this.cardsPerView);
    this.currentIndex = Math.max(0, Math.min(index, maxIndex));
    this.updateCarousel();
  }

  nextSlide() {
    const maxIndex = Math.max(0, this.totalSlides - this.cardsPerView);
    if (this.currentIndex < maxIndex) {
      this.currentIndex++;
      this.updateCarousel();
    }
  }

  prevSlide() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateCarousel();
    }
  }

  setupEventListeners() {
    if (this.prevBtn) {
      this.prevBtn.addEventListener("click", () => this.prevSlide());
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener("click", () => this.nextSlide());
    }

    // Navegação por teclado
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") this.prevSlide();
      if (e.key === "ArrowRight") this.nextSlide();
    });

    // Swipe para dispositivos móveis
    let startX = 0;
    let endX = 0;

    this.track.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
    });

    this.track.addEventListener("touchmove", (e) => {
      endX = e.touches[0].clientX;
    });

    this.track.addEventListener("touchend", () => {
      const diff = startX - endX;
      const swipeThreshold = 50;

      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          this.nextSlide();
        } else {
          this.prevSlide();
        }
      }
    });
  }

  setupResizeHandler() {
    window.addEventListener("resize", () => {
      this.cardsPerView = this.getCardsPerView();
      this.updateSlideWidth();
      this.goToSlide(
        Math.min(
          this.currentIndex,
          Math.max(0, this.totalSlides - this.cardsPerView)
        )
      );
    });
  }
}

// VERSÃO MÍNIMA - Scroll básico entre seções
let canScroll = true;
let scrollTimer;

document.addEventListener(
  "wheel",
  function (e) {
    if (!canScroll) return;

    const sections = document.querySelectorAll("section");
    const direction = e.deltaY > 0 ? 1 : -1; // 1 = baixo, -1 = cima

    let currentIndex = 0;
    const windowMiddle = window.scrollY + window.innerHeight / 2;

    // Encontra seção atual
    sections.forEach((section, index) => {
      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;

      if (windowMiddle >= sectionTop && windowMiddle < sectionBottom) {
        currentIndex = index;
      }
    });

    // Calcula próxima seção
    const nextIndex = currentIndex + direction;

    // Verifica limites
    if (nextIndex >= 0 && nextIndex < sections.length) {
      // Previne scroll padrão
      e.preventDefault();

      // Bloqueia novos scrolls temporariamente
      canScroll = false;

      // Faz o scroll
      sections[nextIndex].scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      // Libera scroll após 700ms
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        canScroll = true;
      }, 700);
    }
  },
  { passive: false }
);

// Função showMore para projetos
function showMore(projectId) {
  const projects = {
    project1: {
      title: "E-commerce Moderno",
      description:
        "Desenvolvi uma plataforma de e-commerce completa utilizando React.js no front-end e Node.js no back-end. O projeto inclui: sistema de carrinho dinâmico, checkout em 3 passos, integração com APIs de pagamento (Stripe e PayPal), design responsivo mobile-first, e otimização de performance com lazy loading e code splitting.",
    },
    project2: {
      title: "Dashboard Analytics",
      description:
        "Dashboard construído com Vue.js e D3.js para visualização de dados. Features incluem: gráficos interativos em tempo real, exportação de relatórios em PDF/Excel, filtros avançados com múltiplos parâmetros, dark/light mode, e sistema de notificações push para alertas importantes.",
    },
    project3: {
      title: "App de Finanças Pessoais",
      description:
        "PWA desenvolvida com Next.js e Firebase. Funcionalidades: sincronização em tempo real entre dispositivos, categorização inteligente de transações, metas financeiras com acompanhamento visual, relatórios mensais/anuais, e notificações para contas a pagar. Aplicação tem 95+ no Lighthouse.",
    },
    project4: {
      title: "Design System Corporativo",
      description:
        "Sistema completo de componentes reutilizáveis com documentação interativa. Inclui tokens de design, guias de estilo e suporte a múltiplos temas. Implementado com Storybook e testado com Jest.",
    },
    project5: {
      title: "Plataforma de Aprendizado",
      description:
        "Solução educacional com pesquisa de UX e gamificação integrada. Inclui sistema de progresso, badges, quizzes interativos e dashboard de desempenho. Desenvolvida com React Native para mobile e React para web.",
    },
  };

  const project = projects[projectId];
  if (project) {
    alert(
      `📋 ${project.title}\n\n${project.description}\n\n🚀 Clique em OK para ver mais detalhes!`
    );

    setTimeout(() => {
      console.log(`Redirecionando para página de ${project.title}...`);
    }, 2000);
  }
}

// Animação sheen para botões
let anims = [...document.querySelectorAll("[anim]")];
let click = (el, cb) => el.addEventListener("click", cb);
let toggle = (el) => el.classList.toggle("toggled");
let clickTog = (el) => click(el, () => toggle(el));
anims.map(clickTog);

// Inicializar tudo quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM carregado - inicializando...");

  // Inicializar carrossel
  setTimeout(() => {
    const carousel = new Carousel();
    console.log("Carrossel inicializado:", carousel);
  }, 100);

  // Efeito de entrada suave para os cards
  const cards = document.querySelectorAll(".project-card, .carousel-slide");
  cards.forEach((card, index) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";

    setTimeout(() => {
      card.style.transition = "opacity 0.6s ease, transform 0.6s ease";
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }, 200 * index);
  });
});

function openProjectLink(url) {
    window.open(url, '_blank');
}

function openProjectLinkGit(url) {
    window.open(url, '_blank');
}