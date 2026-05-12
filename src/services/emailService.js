import emailjs from '@emailjs/browser';
const API = import.meta.env.VITE_API_URL;


const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_penoe9y',
  TEMPLATE_ID_VENCIMIENTO: 'template_gk7cllh',
  TEMPLATE_ID_ACTIVACION: 'template_ofwuas8',
  PUBLIC_KEY: '8bThJu5vUmfB7LfxS'
};


const EMAILJS_CONFIG_CREDENCIALES = {
  SERVICE_ID: 'service_1jr3j5c',  
  TEMPLATE_ID_CREDENCIALES: 'template_zu951rc', 
  TEMPLATE_ID_BIENVENIDA: 'template_ofwuas8',
  PUBLIC_KEY: 'jLrk8oTINcs386RKq'  
};

export const isEmailConfigured = () => {
  const isConfigured = Boolean(
    EMAILJS_CONFIG.SERVICE_ID && 
    EMAILJS_CONFIG.PUBLIC_KEY && 
    EMAILJS_CONFIG.TEMPLATE_ID_VENCIMIENTO && 
    EMAILJS_CONFIG.TEMPLATE_ID_ACTIVACION
  );
  

  return isConfigured;
};


export const isEmailCredencialesConfigured = () => {
  const isConfigured = Boolean(
    EMAILJS_CONFIG_CREDENCIALES.SERVICE_ID && 
    EMAILJS_CONFIG_CREDENCIALES.PUBLIC_KEY && 
    EMAILJS_CONFIG_CREDENCIALES.TEMPLATE_ID_CREDENCIALES
  );
  
  return isConfigured;
};

try {
  emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);

} catch (error) {
  console.error('❌ Error al inicializar EmailJS Principal:', error);
}


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


    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID_VENCIMIENTO,
      templateParams
    );

    const token = localStorage.getItem("token");
    await registrarEmailHistorial({
      clienteNombre: cliente.nombre,
      clienteDNI: cliente.dni,
      clienteEmail: cliente.email,
      tipo,
      fechaEnvio: new Date().toISOString(),
      estado: "Enviado",
      error: null,
      asunto: "Membresía Vencida - HULK GYM"
    }, token);


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


export const generarTokenActivacion = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) +
         Date.now().toString(36);
};


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

    const activationUrl = `${window.location.origin}/login?token=${token}&email=${cliente.email}`;

    const templateParams = {
      to_email: cliente.email,
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


    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID_ACTIVACION,
      templateParams
    );

    
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


export const enviarEmailBienvenida = async (cliente, password, token) => {
  if (!isEmailCredencialesConfigured()) {
    console.warn('⚠️ EmailJS (Bienvenida) no está configurado.');

    return {
      success: false,
      error: 'EmailJS para bienvenida no configurado',
      messageId: null
    };
  }

  try {

    emailjs.init(EMAILJS_CONFIG_CREDENCIALES.PUBLIC_KEY);

    const loginUrl = `${window.location.origin}/login?token=${token}&email=${cliente.email}`;

    const templateParams = {
      to_email: cliente.email,
      to_name: cliente.nombre,

      cliente_nombre: cliente.nombre,
      usuario_email: cliente.email,
      usuario_password: password,

      login_url: loginUrl,

      gimnasio_nombre: 'HULK GYM',
      gimnasio_contacto: 'hulkgym670@gmail.com',

      expiracion_dias: 7,
      anio_actual: new Date().getFullYear()
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG_CREDENCIALES.SERVICE_ID,
      EMAILJS_CONFIG_CREDENCIALES.TEMPLATE_ID_BIENVENIDA,
      templateParams
    );

    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);

    return {
      success: true,
      messageId: response.text,
      message: 'Email de bienvenida enviado correctamente'
    };

  } catch (error) {

    console.error('❌ Error al enviar email de bienvenida:', error);

    try {
      emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
    } catch (initError) {
      console.error('❌ Error restaurando EmailJS principal:', initError);
    }

    return {
      success: false,
      error: error.text || error.message || 'Error desconocido',
      messageId: null
    };
  }
};


export const verificarYNotificarExpiraciones = async () => {
  
  try {
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
    
    
    const hoy = new Date();
    let emailsEnviados = 0;
    let errores = 0;
    
    const clientesVencidos = clientes.filter(cliente => {
      
      if (!cliente || !cliente.email || !cliente.vencimiento) {
        return false;
      }
      
      try {
        const [dia, mes, anio] = cliente.vencimiento.split("/");
        if (!dia || !mes || !anio) {
          return false;
        }
        
        const fechaVencimiento = new Date(`${anio}-${mes}-${dia}T23:59:59`);
        if (isNaN(fechaVencimiento.getTime())) {
          return false;
        }
        
        const estaVencido = fechaVencimiento < hoy;

        return estaVencido;
      } catch (error) {
        return false;
      }
    });
    
    
    if (clientesVencidos.length === 0) {
      return {
        totalVerificados: clientes.length,
        clientesVencidos: 0,
        emailsEnviados: 0,
        errores: 0
      };
    }
    
    for (const cliente of clientesVencidos) {
      try {
        const resultado = await enviarEmailReal(cliente, 'vencimiento');
        
        if (resultado.success) {
          emailsEnviados++;
        } else {
          errores++;
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`❌ Error al enviar email a ${cliente.nombre}:`, error);
        errores++;
      }
    }
    
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


export const verificarVencimientosAutomaticos = async () => {
  const ultimaVerificacion = localStorage.getItem('ultimaVerificacionAutomatica');
  const hoy = new Date();
  const fechaHoy = hoy.toDateString();

  if (ultimaVerificacion === fechaHoy) {
    return {
      yaVerificado: true,
      mensaje: 'Verificación ya realizada hoy'
    };
  }

  try {
    const clientesStr = localStorage.getItem('clientes');
    const clientes = clientesStr ? JSON.parse(clientesStr) : [];
    const historialStr = localStorage.getItem('emailHistory');
    const historial = historialStr ? JSON.parse(historialStr) : [];

    let emailsEnviados = 0;
    let errores = 0;

    const clientesVencidosHoy = clientes.filter(cliente => {
      if (!cliente || !cliente.email || !cliente.vencimiento) return false;
      try {
        const [dia, mes, anio] = cliente.vencimiento.split("/");
        const fechaVencimiento = new Date(`${anio}-${mes}-${dia}T23:59:59`);
        const esHoy = fechaVencimiento.toDateString() === fechaHoy;
        if (esHoy) {
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


    if (clientesVencidosHoy.length === 0) {
      localStorage.setItem('ultimaVerificacionAutomatica', fechaHoy);
      return {
        totalVerificados: clientes.length,
        clientesVencidos: 0,
        emailsEnviados: 0,
        errores: 0
      };
    }

    for (const cliente of clientesVencidosHoy) {
      try {
        const resultado = await enviarEmailReal(cliente, 'vencimiento');
        if (resultado.success) {
          emailsEnviados++;
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
            automatico: true
          };
          historial.push(nuevoEmail);
          localStorage.setItem('emailHistory', JSON.stringify(historial));
        } else {
          errores++;
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`❌ [AUTO] Error con ${cliente.nombre}:`, error);
        errores++;
      }
    }

    localStorage.setItem('ultimaVerificacionAutomatica', fechaHoy);


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
      error: { message: error.message || 'Error desconocido' },
      totalVerificados: 0,
      clientesVencidos: 0,
      emailsEnviados: 0,
      errores: 1
    };
  }
};

export const registrarEmailHistorial = async (emailData, token) => {
  try {
    const res = await fetch(`${API}/api/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(emailData)
    });
    if (!res.ok) throw new Error("No se pudo registrar el email en el historial");
    return await res.json();
  } catch (error) {
    console.error("❌ Error al registrar email en historial:", error);
    return null;
  }
};

export const enviarCredencialesAcceso = async () => {
  console.warn("⚠️ enviarCredencialesAcceso mock (modo local)");
  return { success: true };
};

export default {
  isEmailConfigured,
  isEmailCredencialesConfigured,
  enviarEmailReal,
  generarTokenActivacion,
  enviarEmailActivacion,
  verificarYNotificarExpiraciones,
  verificarVencimientosAutomaticos,
    registrarEmailHistorial,
    enviarEmailBienvenida,
};
