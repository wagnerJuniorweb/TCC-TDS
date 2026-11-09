package com.estiloenavalha;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class EstiloNavalhaApplication {

    public static void main(String[] args) {

        SpringApplication.run(
            EstiloNavalhaApplication.class,
            args
        );

        System.out.println(
            "ESTILO & NAVALHA INICIADA COM SUCESSO!"
        );
    }
}//1