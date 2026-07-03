/**
 * Internationalization (i18n) Service
 * Manages translations for error messages and UI text
 * Supports multiple languages with fallback to English
 */

export type Language = "en" | "es" | "fr" | "de";

export interface TranslationsDictionary {
  [key: string]: string | TranslationsDictionary;
}

// Error message translations
const translations: Record<Language, TranslationsDictionary> = {
  en: {
    errors: {
      unknown: "An unexpected error occurred. Please try again.",
      networkError: "Network error. Please check your connection and try again.",
      timeout: "Request timeout. The server took too long to respond.",
      notFound: "The requested resource was not found.",
      unauthorized: "You are not authorized to perform this action.",
      forbidden: "Access denied.",
      badRequest: "Invalid request. Please check your input.",
      conflict: "This item already exists.",
      serverError: "Server error. Please try again later.",
      serviceUnavailable: "Service temporarily unavailable. Please try again later.",
      validationError: "Please check your input and try again.",
      authFailed: "Authentication failed. Please log in again.",
      tokenExpired: "Your session has expired. Please log in again.",
      invalidCredentials: "Invalid email or password.",
      userNotFound: "User not found.",
      projectNotFound: "Project not found.",
      taskNotFound: "Task not found.",
      commentNotFound: "Comment not found.",
      failedToLoad: "Failed to load data.",
      failedToCreate: "Failed to create item.",
      failedToUpdate: "Failed to update item.",
      failedToDelete: "Failed to delete item.",
      failedToFetch: "Failed to load notifications.",
      unexpectedError: "Something went wrong",
      tryAgain: "Please try again",
      contactSupport: "Contact support for help",
    },
    messages: {
      loading: "Loading...",
      saving: "Saving...",
      deleting: "Deleting...",
      success: "Success!",
      warning: "Warning",
      error: "Error",
      info: "Information",
    },
    buttons: {
      retry: "Retry",
      cancel: "Cancel",
      ok: "OK",
      close: "Close",
      save: "Save",
      delete: "Delete",
      confirm: "Confirm",
      goHome: "Go Home",
    },
  },
  es: {
    errors: {
      unknown: "Ocurrió un error inesperado. Por favor, inténtelo de nuevo.",
      networkError: "Error de red. Por favor, verifique su conexión e inténtelo de nuevo.",
      timeout: "Tiempo de espera agotado. El servidor tardó demasiado en responder.",
      notFound: "No se encontró el recurso solicitado.",
      unauthorized: "No está autorizado para realizar esta acción.",
      forbidden: "Acceso denegado.",
      badRequest: "Solicitud inválida. Por favor, verifique su entrada.",
      conflict: "Este elemento ya existe.",
      serverError: "Error del servidor. Por favor, inténtelo más tarde.",
      serviceUnavailable: "Servicio temporalmente no disponible. Por favor, inténtelo más tarde.",
      validationError: "Por favor, verifique su entrada e inténtelo de nuevo.",
      authFailed: "Autenticación fallida. Por favor, inicie sesión de nuevo.",
      tokenExpired: "Su sesión ha expirado. Por favor, inicie sesión de nuevo.",
      invalidCredentials: "Correo electrónico o contraseña inválidos.",
      userNotFound: "Usuario no encontrado.",
      projectNotFound: "Proyecto no encontrado.",
      taskNotFound: "Tarea no encontrada.",
      commentNotFound: "Comentario no encontrado.",
      failedToLoad: "No se pudieron cargar los datos.",
      failedToCreate: "No se pudo crear el elemento.",
      failedToUpdate: "No se pudo actualizar el elemento.",
      failedToDelete: "No se pudo eliminar el elemento.",
      failedToFetch: "No se pudieron cargar las notificaciones.",
      unexpectedError: "Algo salió mal",
      tryAgain: "Por favor, inténtelo de nuevo",
      contactSupport: "Póngase en contacto con soporte para obtener ayuda",
    },
    messages: {
      loading: "Cargando...",
      saving: "Guardando...",
      deleting: "Eliminando...",
      success: "¡Éxito!",
      warning: "Advertencia",
      error: "Error",
      info: "Información",
    },
    buttons: {
      retry: "Reintentar",
      cancel: "Cancelar",
      ok: "Aceptar",
      close: "Cerrar",
      save: "Guardar",
      delete: "Eliminar",
      confirm: "Confirmar",
      goHome: "Ir a Inicio",
    },
  },
  fr: {
    errors: {
      unknown: "Une erreur inattendue s'est produite. Veuillez réessayer.",
      networkError:
        "Erreur réseau. Veuillez vérifier votre connexion et réessayer.",
      timeout: "Délai d'attente dépassé. Le serveur a pris trop de temps pour répondre.",
      notFound: "La ressource demandée n'a pas été trouvée.",
      unauthorized: "Vous n'êtes pas autorisé à effectuer cette action.",
      forbidden: "Accès refusé.",
      badRequest: "Demande invalide. Veuillez vérifier votre saisie.",
      conflict: "Cet élément existe déjà.",
      serverError: "Erreur du serveur. Veuillez réessayer plus tard.",
      serviceUnavailable:
        "Service temporairement indisponible. Veuillez réessayer plus tard.",
      validationError: "Veuillez vérifier votre saisie et réessayer.",
      authFailed: "Échec de l'authentification. Veuillez vous reconnecter.",
      tokenExpired: "Votre session a expiré. Veuillez vous reconnecter.",
      invalidCredentials: "E-mail ou mot de passe invalide.",
      userNotFound: "Utilisateur non trouvé.",
      projectNotFound: "Projet non trouvé.",
      taskNotFound: "Tâche non trouvée.",
      commentNotFound: "Commentaire non trouvé.",
      failedToLoad: "Impossible de charger les données.",
      failedToCreate: "Impossible de créer l'élément.",
      failedToUpdate: "Impossible de mettre à jour l'élément.",
      failedToDelete: "Impossible de supprimer l'élément.",
      failedToFetch: "Impossible de charger les notifications.",
      unexpectedError: "Quelque chose s'est mal passé",
      tryAgain: "Veuillez réessayer",
      contactSupport: "Contactez le support pour obtenir de l'aide",
    },
    messages: {
      loading: "Chargement...",
      saving: "Enregistrement...",
      deleting: "Suppression...",
      success: "Succès !",
      warning: "Avertissement",
      error: "Erreur",
      info: "Information",
    },
    buttons: {
      retry: "Réessayer",
      cancel: "Annuler",
      ok: "OK",
      close: "Fermer",
      save: "Enregistrer",
      delete: "Supprimer",
      confirm: "Confirmer",
      goHome: "Aller à l'accueil",
    },
  },
  de: {
    errors: {
      unknown: "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
      networkError: "Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.",
      timeout: "Zeitüberschreitung. Der Server hat zu lange gebraucht, um zu antworten.",
      notFound: "Die angeforderte Ressource wurde nicht gefunden.",
      unauthorized: "Sie sind nicht berechtigt, diese Aktion auszuführen.",
      forbidden: "Zugriff verweigert.",
      badRequest: "Ungültige Anfrage. Bitte überprüfen Sie Ihre Eingabe.",
      conflict: "Dieses Element existiert bereits.",
      serverError: "Serverfehler. Bitte versuchen Sie es später erneut.",
      serviceUnavailable:
        "Service vorübergehend nicht verfügbar. Bitte versuchen Sie es später erneut.",
      validationError: "Bitte überprüfen Sie Ihre Eingabe und versuchen Sie es erneut.",
      authFailed: "Authentifizierung fehlgeschlagen. Bitte melden Sie sich erneut an.",
      tokenExpired: "Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.",
      invalidCredentials: "Ungültige E-Mail oder Passwort.",
      userNotFound: "Benutzer nicht gefunden.",
      projectNotFound: "Projekt nicht gefunden.",
      taskNotFound: "Aufgabe nicht gefunden.",
      commentNotFound: "Kommentar nicht gefunden.",
      failedToLoad: "Fehler beim Laden von Daten.",
      failedToCreate: "Fehler beim Erstellen von Element.",
      failedToUpdate: "Fehler beim Aktualisieren von Element.",
      failedToDelete: "Fehler beim Löschen von Element.",
      failedToFetch: "Fehler beim Laden von Benachrichtigungen.",
      unexpectedError: "Etwas ist schief gelaufen",
      tryAgain: "Bitte versuchen Sie es erneut",
      contactSupport: "Kontaktieren Sie den Support für Hilfe",
    },
    messages: {
      loading: "Wird geladen...",
      saving: "Wird gespeichert...",
      deleting: "Wird gelöscht...",
      success: "Erfolg!",
      warning: "Warnung",
      error: "Fehler",
      info: "Information",
    },
    buttons: {
      retry: "Wiederholen",
      cancel: "Abbrechen",
      ok: "OK",
      close: "Schließen",
      save: "Speichern",
      delete: "Löschen",
      confirm: "Bestätigen",
      goHome: "Zur Startseite",
    },
  },
};

class I18nService {
  private currentLanguage: Language = "en";

  constructor() {
    // Try to detect language from browser or localStorage
    const savedLanguage = localStorage.getItem("language") as Language;
    const browserLanguage = (navigator.language.split("-")[0] as Language) || "en";

    this.currentLanguage = savedLanguage || (browserLanguage in translations ? browserLanguage : "en");
  }

  /**
   * Set the current language
   */
  setLanguage(lang: Language): void {
    if (lang in translations) {
      this.currentLanguage = lang;
      localStorage.setItem("language", lang);
    }
  }

  /**
   * Get the current language
   */
  getLanguage(): Language {
    return this.currentLanguage;
  }

  /**
   * Get available languages
   */
  getAvailableLanguages(): Language[] {
    return Object.keys(translations) as Language[];
  }

  /**
   * Translate a key (supports nested keys like "errors.notFound")
   */
  t(key: string, defaultValue?: string): string {
    const keys = key.split(".");
    let value: any = translations[this.currentLanguage];

    for (const k of keys) {
      if (value?.[k]) {
        value = value[k];
      } else {
        // Try English as fallback
        value = translations.en;
        for (const fallbackK of keys) {
          value = value?.[fallbackK];
        }
        return typeof value === "string" ? value : defaultValue || key;
      }
    }

    return typeof value === "string" ? value : defaultValue || key;
  }

  /**
   * Get all translations for current language
   */
  getTranslations(): TranslationsDictionary {
    return translations[this.currentLanguage];
  }

  /**
   * Format error message based on error code
   */
  getErrorMessage(errorCode: string, defaultMessage?: string): string {
    const errorKey = `errors.${errorCode}`;
    return this.t(errorKey, defaultMessage || "An error occurred");
  }
}

// Export singleton instance
const i18n = new I18nService();

export default i18n;
