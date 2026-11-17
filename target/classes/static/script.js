// ========================================
// ESTILO & NAVALHA
// JAVASCRIPT PRINCIPAL
// ========================================

// DADOS DO AGENDAMENTO

let selectedService = null;
let selectedPrice = 0;
let selectedTime = null;

// CHAVE PIX
// Substitua pelo Pix verdadeiro da barbearia.

const PIX_KEY = "SUA_CHAVE_PIX_AQUI";

// MENU MOBILE

function toggleMenu() {
    document.getElementById("menu").classList.toggle("show");
}

// ETAPAS DO AGENDAMENTO

function nextStep(step) {

    if (step === 2 && !selectedService) {
        alert("Selecione um serviço primeiro!");
        return;
    }

    if (step === 3) {

        const barber = document.getElementById("barber").value;
        const date = document.getElementById("date").value;

        if (!barber || !date || !selectedTime) {
            alert("Selecione profissional, data e horário!");
            return;
        }

        const selectedDate = new Date(date + "T00:00:00");
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            alert("Não é possível escolher uma data passada!");
            return;
        }
    }

    if (step === 4) {

        const name = document.getElementById("clientName").value.trim();
        const phone = document.getElementById("clientPhone").value.trim();

        if (!name || !phone) {
            alert("Preencha seu nome e WhatsApp!");
            return;
        }

        updateSummary();
    }

    document.querySelectorAll(".step").forEach(element => {
        element.classList.remove("active");
    });

    document.getElementById("step" + step).classList.add("active");

    for (let i = 1; i <= 4; i++) {
        document.getElementById("progress" + i)
            .classList.toggle("active", i <= step);
    }

    window.scrollTo({
        top: document.getElementById("agendamento").offsetTop - 100,
        behavior: "smooth"
    });
}

// SELECIONAR SERVIÇO

function selectService(element, service, price) {

    document.querySelectorAll(".service-card").forEach(card => {
        card.classList.remove("selected");
    });

    element.classList.add("selected");

    selectedService = service;
    selectedPrice = price;

    document.getElementById("selectedServiceText").textContent =
        service + " - " + formatPrice(price);
}

// SELECIONAR HORÁRIO

function selectTime(element, time) {

    document.querySelectorAll(".time-grid button").forEach(button => {
        button.classList.remove("selected");
    });

    element.classList.add("selected");

    selectedTime = time;
}

// FORMATAR PREÇO

function formatPrice(price) {

    return price.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// MOSTRAR PIX

function showPix() {

    const pixOption = document.querySelector(
        'input[name="payment"][value="PIX"]'
    );

    document.getElementById("pixArea")
        .classList.toggle("show", pixOption.checked);
}

// COPIAR PIX

async function copyPix() {

    try {
        await navigator.clipboard.writeText(PIX_KEY);
        alert("Chave Pix copiada!");
    } catch (error) {
        alert("Não foi possível copiar. Copie a chave manualmente: " + PIX_KEY);
    }
}

// ATUALIZAR RESUMO

function updateSummary() {

    const barber = document.getElementById("barber").value;
    const date = document.getElementById("date").value;

    const formattedDate = date.split("-").reverse().join("/");

    document.getElementById("summaryService").textContent =
        selectedService;

    document.getElementById("summaryBarber").textContent =
        barber;

    document.getElementById("summaryDate").textContent =
        formattedDate;

    document.getElementById("summaryTime").textContent =
        selectedTime;

    document.getElementById("summaryPrice").textContent =
        formatPrice(selectedPrice);
}

// FINALIZAR AGENDAMENTO

async function finishBooking() {

    const payment = document.querySelector(
        'input[name="payment"]:checked'
    );

    if (!payment) {
        alert("Escolha uma forma de pagamento!");
        return;
    }

    if (!selectedService || !selectedTime) {
        alert("Confira os dados do agendamento.");
        return;
    }

    const appointment = {

        cliente: document.getElementById("clientName").value.trim(),

        telefone: document.getElementById("clientPhone").value.trim(),

        servico: selectedService,

        preco: selectedPrice,

        barbeiro: document.getElementById("barber").value,

        data: document.getElementById("date").value,

        horario: selectedTime,

        pagamento: payment.value

    };

    const button = document.querySelector("#step4 .next-button");

    button.disabled = true;
    button.textContent = "PROCESSANDO...";

    try {

        const response = await fetch("/api/agendamentos", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(appointment)

        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.mensagem || "Erro ao realizar agendamento.");
        }

        document.querySelectorAll(".step").forEach(element => {
            element.classList.remove("active");
        });

        document.querySelector(".progress-container").style.display = "none";

        const success = document.getElementById("successMessage");

        success.classList.add("show");

        let paymentMessage = payment.value === "PIX"
            ? "Pagamento via Pix escolhido. Envie o comprovante à barbearia para confirmação."
            : "Pagamento presencial selecionado.";

        document.getElementById("successText").innerHTML =
            "Olá, <strong>" + escapeHTML(appointment.cliente) +
            "</strong>!<br><br>" +
            "Seu agendamento foi registrado com sucesso!<br>" +
            "Número do agendamento: <strong>" + result.id +
            "</strong><br><br>" +
            paymentMessage;

    } catch (error) {

        alert(error.message);

    } finally {

        button.disabled = false;
        button.textContent = "CONFIRMAR AGENDAMENTO";

    }
}

// PROTEÇÃO AO EXIBIR TEXTO DO CLIENTE

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);

}

// DATA MÍNIMA: HOJE

const dateInput = document.getElementById("date");

const today = new Date();
const localDate = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
).toISOString().split("T")[0];

dateInput.min = localDate;

// MOSTRAR A CHAVE PIX CONFIGURADA

document.getElementById("pixKey").textContent = PIX_KEY;