import { TeamSpeak, QueryProtocol, TeamSpeakClient } from "ts3-nodejs-library";
import axios from "axios";
import config from "./config";

(async () => {
    try {
        const ts3 = await TeamSpeak.connect({
            host: config.ts3.host,
            queryport: 10011,
            username: config.ts3.user,
            password: config.ts3.pass,
            protocol: QueryProtocol.RAW,
            serverport: Number(config.ts3.serverport),
        });

        console.log("Connected to the TS3 server.");

        ts3.on("clientconnect", async (event) => {
            if (!event.client) return;
            const client: TeamSpeakClient = event.client;
            
            console.log(`Player joined: ${client.nickname} (${client.uniqueIdentifier})`);
            
            try {
              const response = await axios.get(`http://v2.api.iphub.info/ip/${client.connectionClientIp}`, {
                headers: {
                  "X-Key": config.apiKey,
                },
              });
      
              if (response.data.block === 1) {
                console.log(`Kicking ${client.nickname} due to VPN or Proxy.`);
                await client.kickFromServer("VPN or Proxy detected. Please disable it and rejoin.");
              }
            } catch (error) {
              console.error("Error checking VPN status:", error);
            }
          });
        } catch (error) {
          console.error("Failed to connect to TeamSpeak:", error);
        }
})();