import React from "react";
import "./Contacts.css";

const FALLBACK_CONTACTS = [
  {
    label: "email",
    value: "hello@example.com",
    url: "mailto:hello@example.com",
  },
  {
    label: "github",
    value: "your-github-id",
    url: "https://github.com/your-github-id",
  },
];

/**
 * Contact links shown above the control panel. Falls back to placeholders so
 * the section always renders even before user_states.yaml has contacts.
 */
export default function Contacts({ contacts }) {
  const list =
    Array.isArray(contacts) && contacts.length ? contacts : FALLBACK_CONTACTS;

  return (
    <div className="contacts">
      <h4 className="contacts__title">Contacts</h4>
      <ul className="contacts__list">
        {list.map((contact) => (
          <li key={contact.label} className="contacts__item">
            <a
              className="contacts__link"
              href={contact.url}
              target="_blank"
              rel="noreferrer"
            >
              <span className="contacts__label">{contact.label}</span>
              <span className="contacts__value">{contact.value}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
