import { VCBCParty } from "./VCBCParty";
import { VCBCProtocol } from "./VCBCProtocol";
import { SignatureScheme } from "./SignatureScheme";

// Initialize signature scheme
const signatureScheme = new SignatureScheme(3, 5); // Threshold 3, total 5 parties

// Create parties
const parties = Array.from({ length: 5 }, (_, i) => new VCBCParty(`P${i + 1}`, signatureScheme));

// Initialize protocol
const protocol = new VCBCProtocol(parties, "test-tag");

// Step 1: Broadcast a message
const sender = parties[0];
protocol.broadcast(sender, "Important Payload");
