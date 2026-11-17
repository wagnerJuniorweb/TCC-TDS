package com.estiloenavalha;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface AgendamentoRepository
        extends JpaRepository<Agendamento, Long> {

    boolean existsByBarbeiroAndDataAndHorarioAndStatusNot(
        String barbeiro,
        LocalDate data,
        LocalTime horario,
        String status
    );

    List<Agendamento> findByTelefone(String telefone);

    List<Agendamento> findByData(LocalDate data);
}