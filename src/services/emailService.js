import emailjs from '@emailjs/browser';

// 🔑 CUENTA PRINCIPAL - Para activación y vencimientos
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_penoe9y',
  TEMPLATE_ID_VENCIMIENTO: 'template_gk7cllh',
  TEMPLATE_ID_ACTIVACION: 'template_ofwuas8',
  PUBLIC_KEY: '8bThJu5vUmfB7LfxS'
};

// 🔑 CUENTA SECUNDARIA - Para enviar credenciales
// Verifica que estos valores estén correctos:
const EMAILJS_CONFIG_CREDENCIALES = {
  SERVICE_ID: 'service_1jr3j5c',  // ✅ Tu Service ID
  TEMPLATE_ID_CREDENCIALES: 'template_zu951rc',  // ✅ Tu Template ID correcto
  PUBLIC_KEY: 'jLrk8oTINcs386RKq'  // ✅ Tu Public Key
};

// Verificar si EmailJS está configurado - LÓGICA CORREGIDA
export const isEmailConfigured = () => {
  const isConfigured = Boolean(
    EMAILJS_CONFIG.SERVICE_ID && 
    EMAILJS_CONFIG.PUBLIC_KEY && 
    EMAILJS_CONFIG.TEMPLATE_ID_VENCIMIENTO && 
    EMAILJS_CONFIG.TEMPLATE_ID_ACTIVACION
  );
  
  console.log('📧 EmailJS (Principal) configurado:', isConfigured);
  return isConfigured;
};

// NUEVO: Verificar si la cuenta de credenciales está configurada
export const isEmailCredencialesConfigured = () => {
  const isConfigured = Boolean(
    EMAILJS_CONFIG_CREDENCIALES.SERVICE_ID && 
    EMAILJS_CONFIG_CREDENCIALES.PUBLIC_KEY && 
    EMAILJS_CONFIG_CREDENCIALES.TEMPLATE_ID_CREDENCIALES
  );
  
  console.log('📧 EmailJS (Credenciales) configurado:', isConfigured);
  return isConfigured;
};

// Inicializar EmailJS con tu Public Key PRINCIPAL (para activación y vencimientos)
try {
  emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
  console.log('✅ EmailJS Principal inicializado correctamente');
} catch (error) {
  console.error('❌ Error al inicializar EmailJS Principal:', error);
}

/**
 * Función para enviar email de vencimiento/recordatorio
 */
export const enviarEmailReal = async (cliente, tipo = 'vencimiento') => {
  if (!isEmailConfigured()) {
    console.warn('⚠️ EmailJS no está configurado.');
    return {
      success: false,
      error: 'EmailJS no configurado',
      messageId: null
    };
  }

  try {
    console.log('📧 Enviando email REAL a:', cliente.nombre);
    console.log('📧 Email destino:', cliente.email);

    // Parámetros para la plantilla de EmailJS
    const templateParams = {
      to_email: cliente.email,
      to_name: cliente.nombre,
      cliente_nombre: cliente.nombre,
      cliente_dni: cliente.dni,
      fecha_vencimiento: cliente.vencimiento,
      fecha_inicio: cliente.fechaInicio,
      precio: cliente.precio ? `$${cliente.precio.toLocaleString()}` : 'N/A',
      tipo_notificacion: tipo === 'vencimiento' ? 'VENCIDA' : 'PRÓXIMA A VENCER',
      mensaje_adicional: tipo === 'vencimiento' 
        ? 'Tu membresía ha vencido. Por favor, acércate al gimnasio para renovarla.'
        : 'Tu membresía está próxima a vencer. Recuerda renovarla a tiempo.',
      gimnasio_nombre: 'HULK GYM',
      gimnasio_contacto: 'contacto@hulkgym.com',
      gimnasio_telefono: '+54 9 11 1234-5678',
      anio_actual: new Date().getFullYear()
    };

    console.log('📤 Enviando con config:', {
      serviceId: EMAILJS_CONFIG.SERVICE_ID,
      templateId: EMAILJS_CONFIG.TEMPLATE_ID_VENCIMIENTO,
      to_email: templateParams.to_email
    });

    // Enviar el email usando EmailJS
    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID_VENCIMIENTO,
      templateParams
    );

    console.log('✅ Email enviado exitosamente:', response);

    return {
      success: true,
      messageId: response.text,
      message: 'Email enviado correctamente'
    };

  } catch (error) {
    console.error('❌ Error al enviar email:', error);
    return {
      success: false,
      error: error.text || error.message || 'Error desconocido',
      messageId: null
    };
  }
};

/**
 * Función para generar token de activación único
 */
export const generarTokenActivacion = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) +
         Date.now().toString(36);
};

/**
 * Función para enviar email de activación de cuenta
 */
export const enviarEmailActivacion = async (cliente, token) => {
  if (!isEmailConfigured()) {
    console.warn('⚠️ EmailJS no está configurado. Usando modo simulación.');
    return {
      success: false,
      error: 'EmailJS no configurado',
      messageId: null
    };
  }

  try {
    console.log('📧 Enviando email de ACTIVACIÓN a:', cliente.nombre);
    console.log('📧 Email destino (cliente):', cliente.email); // Log para debug

    // URL de activación (ajusta según tu dominio en producción)
    const activationUrl = `${window.location.origin}/login?token=${token}&dni=${cliente.dni}`;

    // Parámetros para la plantilla de activación - CORREGIDO
    const templateParams = {
      to_email: cliente.email, // ASEGURARNOS que sea el email del cliente
      to_name: cliente.nombre,
      cliente_nombre: cliente.nombre,
      cliente_dni: cliente.dni,
      activation_link: activationUrl,
      token: token,
      gimnasio_nombre: 'HULK GYM',
      gimnasio_contacto: 'hulkgym670@gmail.com',
      expiracion_dias: 7,
      anio_actual: new Date().getFullYear()
    };

    console.log('📤 Parámetros del email:', {
      destinatario: templateParams.to_email,
      nombre: templateParams.cliente_nombre,
      dni: templateParams.cliente_dni
    });

    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID_ACTIVACION,
      templateParams
    );

    console.log('✅ Email de activación enviado a:', cliente.email);
    console.log('Response:', response);

    return {
      success: true,
      messageId: response.text,
      message: 'Email de activación enviado correctamente'
    };

  } catch (error) {
    console.error('❌ Error al enviar email de activación:', error);
    return {
      success: false,
      error: error.text || error.message || 'Error desconocido',
      messageId: null
    };
  }
};

/**
 * MODIFICADO: Función para enviar credenciales de acceso
 * Usa una cuenta DIFERENTE de EmailJS
 */
export const enviarCredencialesAcceso = async (cliente, password) => {
  if (!isEmailCredencialesConfigured()) {
    console.warn('⚠️ EmailJS (Credenciales) no está configurado.');
    return {
      success: false,
      error: 'EmailJS para credenciales no configurado',
      messageId: null
    };
  }

  try {
    console.log('📧 Enviando credenciales de acceso a:', cliente.nombre);
    console.log('📧 Email destino:', cliente.email);
    console.log('📧 Usando cuenta secundaria de EmailJS');

    // IMPORTANTE: Inicializar temporalmente con la segunda cuenta
    emailjs.init(EMAILJS_CONFIG_CREDENCIALES.PUBLIC_KEY);

    // Parámetros para la plantilla de credenciales
    const templateParams = {
      to_email: cliente.email,
      to_name: cliente.nombre,
      cliente_nombre: cliente.nombre,
      cliente_dni: cliente.dni,
      usuario_email: cliente.email,
      usuario_password: password,
      login_url: `${window.location.origin}/login`,
      gimnasio_nombre: 'HULK GYM',
      gimnasio_contacto: 'hulkgym670@gmail.com',
      anio_actual: new Date().getFullYear()
    };

    console.log('📤 Enviando credenciales con cuenta secundaria:', {
      serviceId: EMAILJS_CONFIG_CREDENCIALES.SERVICE_ID,
      templateId: EMAILJS_CONFIG_CREDENCIALES.TEMPLATE_ID_CREDENCIALES,
      to_email: templateParams.to_email
    });

    const response = await emailjs.send(
      EMAILJS_CONFIG_CREDENCIALES.SERVICE_ID,
      EMAILJS_CONFIG_CREDENCIALES.TEMPLATE_ID_CREDENCIALES,
      templateParams
    );

    console.log('✅ Credenciales enviadas exitosamente:', response);

    // IMPORTANTE: Restaurar la cuenta principal
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
    console.log('🔄 Cuenta principal restaurada');

    return {
      success: true,
      messageId: response.text,
      message: 'Credenciales enviadas correctamente'
    };

  } catch (error) {
    console.error('❌ Error al enviar credenciales:', error);
    
    // IMPORTANTE: Asegurarse de restaurar la cuenta principal incluso si hay error
    try {
      emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
      console.log('🔄 Cuenta principal restaurada después de error');
    } catch (initError) {
      console.error('❌ Error al restaurar cuenta principal:', initError);
    }
    
    return {
      success: false,
      error: error.text || error.message || 'Error desconocido',
      messageId: null
    };
  }
};

/**
 * Función para verificar y notificar expiraciones
 */
export const verificarYNotificarExpiraciones = async () => {
  console.log('🔍 Verificando cuentas vencidas...');
  
  try {
    // Obtener clientes de forma segura
    let clientes = [];
    try {
      const clientesStr = localStorage.getItem('clientes');
      clientes = clientesStr ? JSON.parse(clientesStr) : [];
    } catch (parseError) {
      console.error('Error al parsear clientes:', parseError);
      return {
        error: { message: 'Error al cargar clientes' },
        totalVerificados: 0,
        clientesVencidos: 0,
        emailsEnviados: 0,
        errores: 1
      };
    }
    
    console.log('📊 Total de clientes en localStorage:', clientes.length);
    
    const hoy = new Date();
    let emailsEnviados = 0;
    let errores = 0;
    
    // Filtrar clientes con email y vencidos
    const clientesVencidos = clientes.filter(cliente => {
      console.log(`\n🔍 Verificando cliente: ${cliente?.nombre || 'Sin nombre'}`);
      console.log(`   - Email: ${cliente?.email || 'Sin email'}`);
      console.log(`   - Vencimiento: ${cliente?.vencimiento || 'Sin fecha'}`);
      
      if (!cliente || !cliente.email || !cliente.vencimiento) {
        console.log('   ❌ Cliente sin email o vencimiento');
        return false;
      }
      
      try {
        const [dia, mes, anio] = cliente.vencimiento.split("/");
        if (!dia || !mes || !anio) {
          console.log('   ❌ Formato de fecha inválido');
          return false;
        }
        
        const fechaVencimiento = new Date(`${anio}-${mes}-${dia}T23:59:59`);
        if (isNaN(fechaVencimiento.getTime())) {
          console.log('   ❌ Fecha inválida');
          return false;
        }
        
        const estaVencido = fechaVencimiento < hoy;
        console.log(`   - Fecha vencimiento: ${fechaVencimiento.toLocaleDateString()}`);
        console.log(`   - Está vencido: ${estaVencido ? 'SÍ' : 'NO'}`);
        
        return estaVencido;
      } catch (error) {
        console.log('   ❌ Error al procesar fecha:', error.message);
        return false;
      }
    });
    
    console.log(`\n📊 Clientes vencidos encontrados: ${clientesVencidos.length}`);
    
    if (clientesVencidos.length === 0) {
      return {
        totalVerificados: clientes.length,
        clientesVencidos: 0,
        emailsEnviados: 0,
        errores: 0
      };
    }
    
    // Enviar emails reales
    for (const cliente of clientesVencidos) {
      try {
        console.log(`\n📧 Procesando envío para: ${cliente.nombre}`);
        const resultado = await enviarEmailReal(cliente, 'vencimiento');
        
        if (resultado.success) {
          emailsEnviados++;
          console.log(`✅ Email enviado a ${cliente.nombre}`);
        } else {
          errores++;
          console.log(`❌ Error al enviar email a ${cliente.nombre}:`, resultado.error);
        }
        
        // Esperar 2 segundos entre cada envío
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`❌ Error al enviar email a ${cliente.nombre}:`, error);
        errores++;
      }
    }
    
    console.log(`\n✅ Proceso completado:`);
    console.log(`   - Emails enviados: ${emailsEnviados}`);
    console.log(`   - Errores: ${errores}`);
    
    return {
      totalVerificados: clientes.length,
      clientesVencidos: clientesVencidos.length,
      emailsEnviados,
      errores
    };
  } catch (error) {
    console.error('❌ Error en verificación:', error);
    return {
      error: { message: error.message || 'Error desconocido' },
      totalVerificados: 0,
      clientesVencidos: 0,
      emailsEnviados: 0,
      errores: 1
    };
  }
};

/**
 * NUEVO: Función para verificar automáticamente vencimientos diarios
 * Esta función se ejecuta automáticamente y envía emails a las membresías vencidas
 */
export const verificarVencimientosAutomaticos = async () => {
  console.log('🤖 [AUTO] Iniciando verificación automática de vencimientos...');
  
  // Obtener la última fecha de verificación
  const ultimaVerificacion = localStorage.getItem('ultimaVerificacionAutomatica');
  const hoy = new Date();
  const fechaHoy = hoy.toDateString();
  
  // Si ya se verificó hoy, no hacer nada
  if (ultimaVerificacion === fechaHoy) {
    console.log('✅ [AUTO] Ya se verificó hoy. Saltando verificación.');
    return {
      yaVerificado: true,
      mensaje: 'Verificación ya realizada hoy'
    };
  }
  
  console.log('🔍 [AUTO] Primera verificación del día. Procesando...');
  
  try {
    // Obtener clientes
    const clientesStr = localStorage.getItem('clientes');
    const clientes = clientesStr ? JSON.parse(clientesStr) : [];
    
    // Obtener historial de notificaciones para evitar duplicados
    const historialStr = localStorage.getItem('emailHistory');
    const historial = historialStr ? JSON.parse(historialStr) : [];
    
    let emailsEnviados = 0;
    let errores = 0;
    
    // Filtrar clientes vencidos HOY (que vencieron exactamente hoy)
    const clientesVencidosHoy = clientes.filter(cliente => {
      if (!cliente || !cliente.email || !cliente.vencimiento) return false;
      
      try {
        const [dia, mes, anio] = cliente.vencimiento.split("/");
        const fechaVencimiento = new Date(`${anio}-${mes}-${dia}T23:59:59`);
        
        // Verificar si vence HOY
        const esHoy = fechaVencimiento.toDateString() === fechaHoy;
        
        if (esHoy) {
          // Verificar si ya se le envió email hoy
          const yaNotificadoHoy = historial.some(email => 
            email.clienteDNI === cliente.dni &&
            email.tipo === 'vencimiento' &&
            new Date(email.fechaEnvio).toDateString() === fechaHoy
          );
          
          return !yaNotificadoHoy;
        }
        
        return false;
      } catch (error) {
        return false;
      }
    });
    
    console.log(`📊 [AUTO] Clientes que vencen HOY: ${clientesVencidosHoy.length}`);
    
    if (clientesVencidosHoy.length === 0) {
      localStorage.setItem('ultimaVerificacionAutomatica', fechaHoy);
      return {
        totalVerificados: clientes.length,
        clientesVencidos: 0,
        emailsEnviados: 0,
        errores: 0
      };
    }
    
    // Enviar emails a los clientes que vencen HOY
    for (const cliente of clientesVencidosHoy) {
      try {
        console.log(`📧 [AUTO] Enviando notificación automática a: ${cliente.nombre}`);
        
        const resultado = await enviarEmailReal(cliente, 'vencimiento');
        
        if (resultado.success) {
          emailsEnviados++;
          
          // Guardar en historial
          const nuevoEmail = {
            id: Date.now() + Math.random(),
            clienteNombre: cliente.nombre,
            clienteDNI: cliente.dni,
            clienteEmail: cliente.email,
            tipo: 'vencimiento',
            fechaEnvio: new Date().toLocaleString('es-AR'),
            estado: 'Enviado',
            error: null,
            asunto: 'Membresía Vencida - HULK GYM',
            automatico: true // Marcar como envío automático
          };
          
          historial.push(nuevoEmail);
          localStorage.setItem('emailHistory', JSON.stringify(historial));
          
          console.log(`✅ [AUTO] Notificación enviada a ${cliente.nombre}`);
        } else {
          errores++;
          console.log(`❌ [AUTO] Error al notificar a ${cliente.nombre}`);
        }
        
        // Esperar entre envíos
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`❌ [AUTO] Error con ${cliente.nombre}:`, error);
        errores++;
      }
    }
    
    // Guardar fecha de verificación
    localStorage.setItem('ultimaVerificacionAutomatica', fechaHoy);
    
    console.log(`✅ [AUTO] Verificación completada: ${emailsEnviados} emails enviados`);
    
    return {
      totalVerificados: clientes.length,
      clientesVencidos: clientesVencidosHoy.length,
      emailsEnviados,
      errores,
      automatico: true
    };
    
  } catch (error) {
    console.error('❌ [AUTO] Error en verificación automática:', error);
    return {
      error: { message: error.message },
      totalVerificados: 0,
      clientesVencidos: 0,
      emailsEnviados: 0,
      errores: 1
    };
  }
};

export default {
  isEmailConfigured,
  isEmailCredencialesConfigured,  // NUEVO: Exportar verificación de cuenta secundaria
  enviarEmailReal,
  generarTokenActivacion,
  enviarEmailActivacion,
  verificarYNotificarExpiraciones,
  verificarVencimientosAutomaticos,
  enviarCredencialesAcceso
};
