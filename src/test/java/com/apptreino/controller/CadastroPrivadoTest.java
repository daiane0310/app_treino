package com.apptreino.controller;

import com.apptreino.config.SecurityConfig;
import com.apptreino.model.TipoUsuario;
import com.apptreino.model.Usuario;
import com.apptreino.repository.UsuarioRepository;
import com.apptreino.security.JwtAuthenticationFilter;
import com.apptreino.security.JwtService;
import com.apptreino.security.RestAccessDeniedHandler;
import com.apptreino.security.RestAuthenticationEntryPoint;
import com.apptreino.service.UsuarioService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = UsuarioController.class, properties = {
        "app.cors.allowed-origins=http://localhost:5173",
        "jwt.secret=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
        "jwt.expiration-ms=60000"
})
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtService.class,
        RestAuthenticationEntryPoint.class, RestAccessDeniedHandler.class})
class CadastroPrivadoTest {

    @Autowired MockMvc mvc;
    @Autowired JwtService jwt;
    @MockitoBean UsuarioRepository usuarios;
    @MockitoBean UsuarioService usuarioService;

    @Test
    void rejeitaCadastroAnonimo() throws Exception {
        mvc.perform(post("/usuarios").contentType(MediaType.APPLICATION_JSON).content(dados("ADMIN")))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(usuarios);
    }

    @ParameterizedTest
    @EnumSource(value = TipoUsuario.class, names = {"ALUNO", "PERSONAL"})
    void rejeitaCadastroSemPerfilAdministrativo(TipoUsuario tipo) throws Exception {
        mvc.perform(post("/usuarios").header("Authorization", token(tipo))
                        .contentType(MediaType.APPLICATION_JSON).content(dados("ADMIN")))
                .andExpect(status().isForbidden());
        verifyNoInteractions(usuarios);
    }

    @Test
    void administradorPodeCadastrarAlunoSemExporSenha() throws Exception {
        when(usuarios.save(any(Usuario.class))).thenAnswer(invocation -> invocation.getArgument(0));
        mvc.perform(post("/usuarios").header("Authorization", token(TipoUsuario.ADMIN))
                        .contentType(MediaType.APPLICATION_JSON).content(dados("ALUNO")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tipo").value("ALUNO"))
                .andExpect(jsonPath("$.senha").doesNotExist());
        verify(usuarios).save(argThat(usuario -> usuario.getTipo() == TipoUsuario.ALUNO
                && !usuario.getSenha().equals("senha-sintetica")));
    }

    private String token(TipoUsuario tipo) {
        return "Bearer " + jwt.gerarToken(new Usuario(1L, "Teste", "teste@example.test", "", tipo));
    }

    private String dados(String tipo) {
        return """
                {"nome":"Conta teste","email":"conta@example.test","senha":"senha-sintetica","tipo":"%s"}
                """.formatted(tipo);
    }
}
