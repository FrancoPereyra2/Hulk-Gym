import emailjs from '@emailjs/browser';

// Configuración de EmailJS - REEMPLAZA CON TUS CREDENCIALES REALES
const EMAIL_CONFIG = {
  serviceId: 'service_penoe9y', // Tu Service ID de EmailJS
  templateId: 'template_gk7cllh', // Tu Template ID de EmailJS
  publicKey: '8bThJu5vUmfB7LfxS', // Tu Public Key de EmailJS
};

// Inicializar EmailJS
try {
  emailjs.init(EMAIL_CONFIG.publicKey);
} catch (error) {
  console.warn('EmailJS no inicializado:', error);
}

// Función para verificar si está configurado correctamente
export const isEmailConfigured = () => {
  return EMAIL_CONFIG.serviceId !== 'service_penoe9y' && 
         EMAIL_CONFIG.templateId !== 'template_gk7cllh' && 
         EMAIL_CONFIG.publicKey !== '8bThJu5vUmfB7LfxS';
};

// Función para enviar email REAL usando EmailJS
export const enviarEmailReal = async (cliente, tipo = 'vencimiento') => {
  try {
    // Verificar configuración
    if (!isEmailConfigured()) {
      throw new Error('EmailJS no está configurado. Configura tus credenciales en emailService.js');
    }

    // Preparar parámetros del email
    const templateParams = {
      to_name: cliente.nombre,
      to_email: cliente.email || `${cliente.dni}@gmail.com`, // Usar email real del cliente
      client_dni: cliente.dni,
      expiry_date: cliente.vencimiento || 'No especificada',
      gym_name: 'HULK GYM',
      message_type: tipo === 'vencimiento' ? 'MEMBRESÍA VENCIDA' : 'RECORDATORIO DE VENCIMIENTO',
      current_date: new Date().toLocaleDateString('es-AR'),
      from_name: 'HULK GYM - Sistema de Notificaciones',
      reply_to: 'hulkgym@contacto.com',
      message: tipo === 'vencimiento' 
        ? `Estimado/a ${cliente.nombre}, su membresía ha vencido el ${cliente.vencimiento}. Por favor, renueve para continuar disfrutando de nuestros servicios.`
        : `Estimado/a ${cliente.nombre}, le recordamos que su membresía vence pronto. Por favor, renueve a tiempo.`
    };

    console.log('🚀 Enviando email REAL a:', templateParams.to_email);

    // Enviar email usando EmailJS
    const result = await emailjs.send(
      EMAIL_CONFIG.serviceId,
      EMAIL_CONFIG.templateId,
      templateParams,
      EMAIL_CONFIG.publicKey
    );

    console.log('✅ Email enviado exitosamente:', result);

    return {
      success: true,
      messageId: result.text,
      status: 'Enviado',
      response: result
    };

  } catch (error) {
    console.error('❌ Error al enviar email REAL:', error);
    return {
      success: false,
      error: error.message,
      status: 'Error'
    };
  }
};

// Función para verificar y notificar expiraciones automáticamente
export const verificarYNotificarExpiraciones = async () => {
  try {
    const savedClientes = localStorage.getItem('clientes');
    const clientes = savedClientes ? JSON.parse(savedClientes) : [];
    
    if (clientes.length === 0) {
      return {
        success: true,
        message: 'No hay clientes registrados',
        enviados: 0,
        errores: 0
      };
    }

    // Verificar cuentas vencidas
    const hoy = new Date();
    const vencidas = clientes.filter(cliente => {
      if (!cliente.vencimiento) return true;
      try {
        const [dia, mes, anio] = cliente.vencimiento.split("/");
        const fechaVencimiento = new Date(`${anio}-${mes}-${dia}T23:59:59`);
        return fechaVencimiento < hoy;
      } catch (error) {
        console.error('Error al procesar fecha:', cliente.vencimiento);
        return false;
      }
    });

    if (vencidas.length === 0) {
      return {
        success: true,
        message: 'No hay cuentas vencidas',
        enviados: 0,
        errores: 0
      };
    }

    // Obtener historial para evitar duplicados
    const savedHistory = localStorage.getItem('emailHistory');
    const emailHistory = savedHistory ? JSON.parse(savedHistory) : [];
    const hace24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const clientesParaNotificar = vencidas.filter(cliente => {
      const ultimoEmail = emailHistory
        .filter(email => 
          email.clienteDNI === cliente.dni && 
          email.estado === 'Enviado'
        )
        .sort((a, b) => new Date(b.fechaEnvio) - new Date(a.fechaEnvio))[0];
      
      return !ultimoEmail || new Date(ultimoEmail.fechaEnvio) < hace24h;
    });

    if (clientesParaNotificar.length === 0) {
      return {
        success: true,
        message: 'Todos los clientes ya fueron notificados en las últimas 24 horas',
        enviados: 0,
        errores: 0
      };
    }

    let enviados = 0;
    let errores = 0;
    const nuevosEmails = [];

    // Enviar emails reales con delay
    for (const cliente of clientesParaNotificar) {
      try {
        console.log(`📧 Enviando email ${enviados + 1}/${clientesParaNotificar.length} a ${cliente.nombre}...`);
        
        const resultado = await enviarEmailReal(cliente, 'vencimiento');
        
        const nuevoEmail = {
          id: Date.now() + Math.random(),
          clienteNombre: cliente.nombre,
          clienteDNI: cliente.dni,
          clienteEmail: cliente.email || `${cliente.dni}@gmail.com`,
          tipo: 'vencimiento',
          fechaEnvio: new Date().toLocaleString('es-AR'),
          estado: resultado.success ? 'Enviado' : 'Error',
          error: resultado.error || null,
          asunto: 'Membresía Vencida - HULK GYM',
          metodo: 'EmailJS',
          messageId: resultado.messageId || null
        };

        nuevosEmails.push(nuevoEmail);
        
        if (resultado.success) {
          enviados++;
          console.log(`✅ Email enviado a ${cliente.nombre}`);
        } else {
          errores++;
          console.log(`❌ Error enviando a ${cliente.nombre}: ${resultado.error}`);
        }

        // Delay entre emails para evitar rate limiting
        if (clientesParaNotificar.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 3000)); // 3 segundos entre emails
        }
        
      } catch (error) {
        console.error('Error procesando cliente:', cliente.nombre, error);
        errores++;
      }
    }

    // Guardar historial actualizado
    const historialActualizado = [...emailHistory, ...nuevosEmails];
    localStorage.setItem('emailHistory', JSON.stringify(historialActualizado));

    return {
      success: true,
      message: `Proceso completado: ${enviados} emails REALES enviados, ${errores} errores`,
      enviados,
      errores,
      total: clientesParaNotificar.length
    };

  } catch (error) {
    console.error('Error en verificarYNotificarExpiraciones:', error);
    return {
      success: false,
      message: 'Error en el proceso de verificación',
      error: error.message,
      enviados: 0,
      errores: 0
    };
  }
};

// Función adicional para enviar email individual
export const enviarEmailExpiracion = async (cliente) => {
  return await enviarEmailReal(cliente, 'vencimiento');
};
