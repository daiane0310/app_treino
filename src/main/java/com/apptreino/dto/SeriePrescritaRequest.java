package com.apptreino.dto;

import java.math.BigDecimal;

public record SeriePrescritaRequest(Integer numeroSerie, Integer repeticoes, BigDecimal carga) { }
