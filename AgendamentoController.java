package com.estiloenavalha;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/agendamentos")
public class AgendamentoController {

    private final AgendamentoRepository repository;

    public AgendamentoController(
            AgendamentoRepository repository) {
        this.repository = repository;
    }

    // CADASTRAR AGENDAMENTO

    @PostMapping
    public ResponseEntity<?> cadastrar(
            @RequestBody Agendamento agendamento) {

        if (agendamento.getCliente() == null ||
            agendamento.getCliente().isBlank()) {

            return ResponseEntity.badRequest().body(
                Map.of("mensagem", "Informe o nome do cliente.")
            );
        }

        if (agendamento.getTelefone() == null ||
            agendamento.getTelefone().isBlank()) {

            return ResponseEntity.badRequest().body(
                Map.of("mensagem", "Informe o telefone.")
            );
        }

        if (agendamento.getServico() == null ||
            agendamento.getBarbeiro() == null ||
            agendamento.getData() == null ||
            agendamento.getHorario() == null ||
            agendamento.getPagamento() == null ||
            agendamento.getPreco() == null) {

            return ResponseEntity.badRequest().body(
                Map.of("mensagem", "Preencha todos os campos.")
            );
        }

        if (!List.of("PIX", "PRESENCIAL")
                .contains(agendamento.getPagamento())) {

            return ResponseEntity.badRequest().body(
                Map.of("mensagem", "Forma de pagamento inválida.")
            );
        }

        if (agendamento.getPreco() <= 0 ||
            agendamento.getPreco() > 10000) {

            return ResponseEntity.badRequest().body(
                Map.of("mensagem", "Valor inválido.")
            );
        }

        if (agendamento.getData().isBefore(LocalDate.now())) {

            return ResponseEntity.badRequest().body(
                Map.of("mensagem", "Data inválida.")
            );
        }

        if (agendamento.getData().equals(LocalDate.now()) &&
            !agendamento.getHorario().isAfter(LocalTime.now())) {

            return ResponseEntity.badRequest().body(
                Map.of("mensagem", "Esse horário já passou.")
            );
        }

        // VERIFICAR CONFLITO DE HORÁRIO

        boolean ocupado =
            repository.existsByBarbeiroAndDataAndHorarioAndStatusNot(
                agendamento.getBarbeiro(),
                agendamento.getData(),
                agendamento.getHorario(),
                "CANCELADO"
            );

        if (ocupado) {

            return ResponseEntity.badRequest().body(
                Map.of(
                    "mensagem",
                    "Esse horário já está reservado. Escolha outro."
                )
            );
        }

        // DEFINIR STATUS

        if ("PIX".equals(agendamento.getPagamento())) {
            agendamento.setStatus("AGUARDANDO_PAGAMENTO");
        } else {
            agendamento.setStatus("AGUARDANDO_ATENDIMENTO");
        }

        // SALVAR NO BANCO

        Agendamento salvo = repository.save(agendamento);

        return ResponseEntity.ok(
            Map.of(
                "mensagem", "Agendamento registrado!",
                "id", salvo.getId(),
                "status", salvo.getStatus()
            )
        );
    }

    // CONSULTAR AGENDAMENTOS PELO TELEFONE

    @GetMapping("/cliente/{telefone}")
    public ResponseEntity<List<Agendamento>> consultarCliente(
            @PathVariable String telefone) {

        List<Agendamento> agendamentos =
            repository.findByTelefone(telefone);

        return ResponseEntity.ok(agendamentos);
    }

    // LISTAR AGENDAMENTOS DE UMA DATA

    @GetMapping("/data/{data}")
    public ResponseEntity<List<Agendamento>> consultarData(
            @PathVariable String data) {

        LocalDate dataConsulta = LocalDate.parse(data);

        return ResponseEntity.ok(
            repository.findByData(dataConsulta)
        );
    }

    // LISTAR TODOS OS AGENDAMENTOS

    @GetMapping
    public ResponseEntity<List<Agendamento>> listarTodos() {

        return ResponseEntity.ok(repository.findAll());
    }

    // CANCELAR AGENDAMENTO

    @PutMapping("/{id}/cancelar")
    public ResponseEntity<?> cancelar(
            @PathVariable Long id) {

        return repository.findById(id)
            .map(agendamento -> {

                agendamento.setStatus("CANCELADO");

                repository.save(agendamento);

                return ResponseEntity.ok(
                    Map.of("mensagem", "Agendamento cancelado!")
                );

            })
            .orElse(
                ResponseEntity.notFound().build()
            );
    }
}