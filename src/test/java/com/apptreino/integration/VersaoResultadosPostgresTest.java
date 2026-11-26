package com.apptreino.integration;

import com.apptreino.repository.UsuarioRepository;
import com.apptreino.security.JwtService;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "jwt.secret=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
        "app.cors.allowed-origins=http://127.0.0.1"
})
@AutoConfigureMockMvc
@EnabledIfEnvironmentVariable(named = "APP_TREINO_TEST_PG_PORT", matches = "[0-9]+")
class VersaoResultadosPostgresTest {
    private static final String USER = "versao_test";
    private static final String DATABASE = "app_treino_versao_teste";
    private static final String EXERCISE = "/execucoes/1/exercicios/1";

    @Autowired MockMvc http;
    @Autowired JdbcTemplate jdbc;
    @Autowired JwtService jwt;
    @Autowired UsuarioRepository usuarios;

    private static String url() {
        return "jdbc:postgresql://127.0.0.1:" + System.getenv("APP_TREINO_TEST_PG_PORT")
                + "/" + DATABASE + "?sslmode=disable";
    }

    private static Connection localDatabase() throws SQLException {
        return DriverManager.getConnection(url(), USER, "");
    }

    @DynamicPropertySource
    static void prepararV3(DynamicPropertyRegistry registry) throws SQLException {
        try (var conn = localDatabase(); var sql = conn.createStatement()) {
            try (var identity = sql.executeQuery("""
                    SELECT current_database(), host(inet_server_addr()), inet_server_port(), current_user,
                        (SELECT count(*) FROM information_schema.tables WHERE table_schema='public')
                    """)) {
                assertTrue(identity.next());
                assertEquals(DATABASE, identity.getString(1));
                assertEquals("127.0.0.1", identity.getString(2));
                assertEquals(System.getenv("APP_TREINO_TEST_PG_PORT"), identity.getString(3));
                assertEquals(USER, identity.getString(4));
                assertEquals(0, identity.getInt(5), "Use um banco descartável vazio");
            }
            Flyway.configure().dataSource(url(), USER, "").target("3").load().migrate();
            sql.execute("""
                    INSERT INTO usuarios (nome,email,senha,tipo) VALUES
                        ('Personal','personal@example.test','teste','PERSONAL'),
                        ('Aluno','aluno@example.test','teste','ALUNO'),
                        ('Outro','outro@example.test','teste','ALUNO');
                    INSERT INTO exercicios (nome,ativo,criado_em,atualizado_em)
                        VALUES ('Supino',true,now(),now());
                    INSERT INTO treinos (nome,aluno_id,personal_id,ativo,criado_em,atualizado_em)
                        VALUES ('Treino',2,1,true,now(),now());
                    INSERT INTO treino_exercicios (treino_id,exercicio_id,ordem)
                        VALUES (1,1,1);
                    INSERT INTO execucoes_treino (treino_id,aluno_id,treino_nome_snapshot,iniciado_em,status)
                        VALUES (1,2,'Treino',now(),'EM_ANDAMENTO');
                    INSERT INTO execucoes_exercicio (execucao_treino_id,treino_exercicio_id,exercicio_id_snapshot,
                        exercicio_nome_snapshot,ordem_planejada,duracao_segundos,observacoes_aluno)
                        VALUES (1,1,1,'Supino',1,60,'legado');
                    INSERT INTO execucoes_series_prescritas
                        (execucao_exercicio_id,numero_serie,repeticoes_planejadas,carga_planejada)
                        VALUES (1,1,12,25);
                    INSERT INTO execucoes_series (execucao_exercicio_id,numero_serie,repeticoes,carga_utilizada,concluida)
                        VALUES (1,1,9,22,true);
                    """);
        }
        registry.add("spring.datasource.url", VersaoResultadosPostgresTest::url);
        registry.add("spring.datasource.username", () -> USER);
        registry.add("spring.datasource.password", () -> "");
    }

    @Test
    void migraLegadoEImpedePerdaDeResultadosConcorrentes() throws Exception {
        String aluno = token("aluno@example.test");
        String outro = token("outro@example.test");
        assertEquals(List.of("1", "2", "3", "4"), jdbc.queryForList(
                "SELECT version FROM flyway_schema_history WHERE success ORDER BY installed_rank", String.class));
        http.perform(get("/execucoes/1").header("Authorization", aluno))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exercicios[0].versaoResultados").value(0))
                .andExpect(jsonPath("$.exercicios[0].series[0].repeticoes").value(9))
                .andExpect(jsonPath("$.exercicios[0].series[0].cargaUtilizada").value(22))
                .andExpect(jsonPath("$.exercicios[0].duracaoSegundos").value(60))
                .andExpect(jsonPath("$.exercicios[0].observacoesAluno").value("legado"));
        assertEquals(400, salvar(aluno, "{}").getResponse().getStatus());
        assertEquals(400, salvar(aluno, "{\"versaoEsperada\":null}").getResponse().getStatus());
        assertEquals(403, salvar(outro, payload(0, 99)).getResponse().getStatus());
        assertEquals(400, salvar(aluno, payload(0, -1)).getResponse().getStatus());
        conferirBanco(0, 9, "legado");

        int vencedor;
        try (var pool = Executors.newFixedThreadPool(2); var gate = localDatabase()) {
            gate.setAutoCommit(false);
            try (var sql = gate.createStatement()) {
                sql.execute("SELECT id FROM execucoes_exercicio WHERE id=1 FOR NO KEY UPDATE");
                var primeira = pool.submit(() -> salvar(aluno, payload(0, 10)));
                var segunda = pool.submit(() -> salvar(aluno, payload(0, 11)));
                try {
                    aguardarDuasAtualizacoesBloqueadas();
                } finally {
                    gate.rollback();
                }
                var a = primeira.get(10, TimeUnit.SECONDS);
                var b = segunda.get(10, TimeUnit.SECONDS);
                assertEquals(List.of(200, 409), List.of(a.getResponse().getStatus(), b.getResponse().getStatus())
                        .stream().sorted().toList());
                vencedor = a.getResponse().getStatus() == 200 ? 10 : 11;
                var resposta = vencedor == 10 ? a : b;
                jsonPath("$.versaoResultados").value(1).match(resposta);
            }
        }
        assertEquals(409, salvar(aluno, payload(0, 99)).getResponse().getStatus());
        conferirBanco(1, vencedor, "atualizado");
        var novo = salvar(aluno, payload(1, vencedor));
        assertEquals(200, novo.getResponse().getStatus());
        jsonPath("$.versaoResultados").value(2).match(novo);
        http.perform(post("/execucoes/1/finalizar").header("Authorization", aluno)).andExpect(status().isOk());
        assertEquals(409, salvar(aluno, payload(2, 99)).getResponse().getStatus());
        conferirBanco(2, vencedor, "atualizado");
    }

    private void aguardarDuasAtualizacoesBloqueadas() throws InterruptedException {
        long limite = System.nanoTime() + TimeUnit.SECONDS.toNanos(5);
        do {
            int esperando = jdbc.queryForObject("""
                    SELECT count(*) FROM pg_stat_activity
                    WHERE datname=current_database() AND wait_event_type='Lock'
                      AND query LIKE 'update execucoes_exercicio%versao_resultados%'
                    """, Integer.class);
            if (esperando == 2) return;
            Thread.sleep(25);
        } while (System.nanoTime() < limite);
        fail("As duas requisições deveriam alcançar a atualização condicional simultaneamente");
    }

    private void conferirBanco(long versao, int repeticoes, String observacoes) {
        assertEquals(versao, jdbc.queryForObject("SELECT versao_resultados FROM execucoes_exercicio WHERE id=1", Long.class));
        assertEquals(observacoes, jdbc.queryForObject("SELECT observacoes_aluno FROM execucoes_exercicio WHERE id=1", String.class));
        assertEquals(List.of(repeticoes), jdbc.queryForList(
                "SELECT repeticoes FROM execucoes_series WHERE execucao_exercicio_id=1", Integer.class));
        assertEquals(List.of(12), jdbc.queryForList(
                "SELECT repeticoes_planejadas FROM execucoes_series_prescritas WHERE execucao_exercicio_id=1", Integer.class));
    }

    private String token(String email) {
        return "Bearer " + jwt.gerarToken(usuarios.findByEmail(email).orElseThrow());
    }

    private MvcResult salvar(String token, String json) throws Exception {
        return http.perform(put(EXERCISE).header("Authorization", token)
                .contentType("application/json").content(json)).andReturn();
    }

    private String payload(long versao, int repeticoes) {
        return """
                {"versaoEsperada":%d,"duracaoSegundos":61,"observacoesAluno":"atualizado",
                 "series":[{"numeroSerie":1,"repeticoes":%d,"cargaUtilizada":22,"concluida":true}]}
                """.formatted(versao, repeticoes);
    }
}
