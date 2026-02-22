"use client";

import { Document, Page, Text, View, StyleSheet, Font, Image } from "@react-pdf/renderer";

// Registracija fontova bez transformacija koje prave bagove
Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.ttf", fontWeight: 'normal' },
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1Mu4mxPZ67pilaCwY6A.ttf", fontWeight: 'bold' }
  ]
});

const s = StyleSheet.create({
  page: { padding: 40, fontFamily: "Roboto", fontSize: 9, color: "#000" },
  
  // ZAGLAVLJE - RASPORED
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between",
    marginBottom: 30, 
    borderBottomWidth: 1, 
    borderBottomColor: "#000", 
    paddingBottom: 15 
  },
  
  // LEVA STRANA: SAMO LOGO
  logoArea: { 
    width: 150, 
  },
  logo: { width: 80, height: 80, objectFit: "contain" },
  
  // DESNA STRANA: PODACI FIRME (STRIKTNO DESNO)
  shopArea: { 
    flex: 1, 
    textAlign: "right",
    alignItems: "flex-end", // Gura Text elemente udesno
  },
  shopName: { 
    fontSize: 16, 
    fontWeight: "bold", 
    marginBottom: 4,
    color: "#000"
  },
  shopText: { fontSize: 8, color: "#333", marginBottom: 1 },
  shopTax: { fontSize: 9, fontWeight: "bold", marginTop: 4 },

  titleSection: { textAlign: "center", marginBottom: 20 },
  title: { fontSize: 15, fontWeight: "bold" },

  section: { borderWidth: 1, borderColor: "#000", marginBottom: 15 },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#000" },
  col: { padding: 8, flex: 1 },
  label: { fontSize: 7, color: "#666", marginBottom: 2, fontWeight: "bold" },
  bold: { fontWeight: "bold" },

  // TABELA
  tableHeader: { backgroundColor: "#f0f0f0", flexDirection: "row", borderBottomWidth: 1 },
  tableRow: { flexDirection: "row", borderBottomWidth: 0.5 },
  cellRb: { width: 30, borderRightWidth: 1, padding: 4, textAlign: "center" },
  cellDesc: { flex: 1, borderRightWidth: 1, padding: 4 },
  cellQty: { width: 40, borderRightWidth: 1, padding: 4, textAlign: "center" },
  cellPrice: { width: 70, borderRightWidth: 1, padding: 4, textAlign: "right" },
  cellTotal: { width: 80, padding: 4, textAlign: "right" },

  footer: { marginTop: "auto" },
  totalBox: { alignItems: "flex-end", marginBottom: 20 },
  totalLabel: { fontSize: 9, fontWeight: "bold" },
  totalValue: { fontSize: 18, fontWeight: "bold", marginTop: 2 },
  
  legal: { fontSize: 6.5, color: "#444", marginBottom: 30, lineHeight: 1.3, borderTopWidth: 0.5, paddingTop: 10 },
  
  // POTPISI U JEDNOJ LINIJI
  signatures: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginTop: 20 
  },
  sigLine: { 
    borderTopWidth: 1, 
    width: "30%", 
    textAlign: "center", 
    paddingTop: 5, 
    fontSize: 8, 
    fontWeight: "bold" 
  },
});

export const WorkOrderPDF = ({ order, shop, customer, vehicle, items }: any) => (
  <Document title={`Radni-Nalog-${order.number}`}>
    <Page size="A4" style={s.page}>
      
      {/* HEADER: LOGO LEVO, PODACI DESNO */}
      <View style={s.header}>
        <View style={s.logoArea}>
          {shop.logoUrl ? (
            <Image src={shop.logoUrl} style={s.logo} />
          ) : null}
        </View>
        
        <View style={s.shopArea}>
          {/* Koristimo .toUpperCase() u JS umesto CSS transformacije */}
          <Text style={s.shopName}>{(shop.name || "").toUpperCase()}</Text>
          <Text style={s.shopText}>{shop.address}</Text>
          <Text style={s.shopText}>{shop.city}</Text>
          <Text style={s.shopText}>Tel: {shop.phone}</Text>
          <View style={s.shopTax}>
            <Text>PIB: {shop.pib}</Text>
            <Text>MB: {shop.maticniBroj}</Text>
          </View>
        </View>
      </View>

      <View style={s.titleSection}>
        <Text style={s.title}>RADNI NALOG BR. {order.number}</Text>
        <Text style={{ fontSize: 8, marginTop: 2 }}>- MEHANIKA -</Text>
      </View>

      {/* KLIJENT I VOZILO */}
      <View style={s.section}>
        <View style={{ flexDirection: "row" }}>
          <View style={[s.col, { borderRightWidth: 1 }]}>
            <Text style={s.label}>NARUČILAC RADOVA:</Text>
            <Text style={[s.bold, { fontSize: 10 }]}>{(customer.name || "").toUpperCase()}</Text>
            <Text>{customer.address}</Text>
            <Text style={s.bold}>Tel: {customer.phone}</Text>
          </View>
          <View style={s.col}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
               <View>
                 <Text style={s.label}>VOZILO:</Text>
                 <Text style={s.bold}>{vehicle.make} {vehicle.model}</Text>
               </View>
               <View style={{ textAlign: "right" }}>
                 <Text style={s.label}>TABLICE:</Text>
                 <Text style={[s.bold, { textDecoration: "underline" }]}>{(vehicle.plateNumber || "").toUpperCase()}</Text>
               </View>
            </View>
            <View>
              <Text style={s.label}>BROJ ŠASIJE (VIN):</Text>
              <Text style={[s.bold, { fontSize: 9, letterSpacing: 1 }]}>{vehicle.vin}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* TABELA */}
      <View style={{ marginTop: 5 }}>
        <View style={s.tableHeader}>
          <Text style={s.cellRb}>RB</Text>
          <Text style={s.cellDesc}>NAZIV DELA / SERVISNE USLUGE</Text>
          <Text style={s.cellQty}>KOL.</Text>
          <Text style={s.cellPrice}>CENA</Text>
          <Text style={s.cellTotal}>IZNOS</Text>
        </View>
        {items.map((item: any, i: number) => (
          <View key={i} style={s.tableRow} wrap={false}>
            <Text style={s.cellRb}>{i + 1}</Text>
            <Text style={s.cellDesc}>{item.description}</Text>
            <Text style={s.cellQty}>{item.quantity}</Text>
            <Text style={s.cellPrice}>{item.price.toLocaleString('sr-RS', { minimumFractionDigits: 2 })}</Text>
            <Text style={[s.cellTotal, s.bold]}>{(item.quantity * item.price).toLocaleString('sr-RS', { minimumFractionDigits: 2 })}</Text>
          </View>
        ))}
      </View>

      {/* FOOTER */}
      <View style={s.footer}>
        <View style={s.totalBox}>
          <Text style={s.totalLabel}>UKUPAN IZNOS ZA NAPLATU (RSD):</Text>
          <Text style={s.totalValue}>
            {order.totalAmount.toLocaleString('sr-RS', { minimumFractionDigits: 2 })}
          </Text>
        </View>

        <Text style={s.legal}>
          Naručilac je saglasan: 1.) Da se izvrše navedeni radovi. 2.) Da se izvrše i obave nepredvidivi radovi koji su neophodni za izvršenje naručenih radova. 
          3.) Da se izvršeni radovi naplate po važećim cenama servisa. 4.) Da po preuzimanju vozila podigne stare delove, u protivnom isti će biti uništeni.
        </Text>

        <View style={s.signatures}>
          <View style={s.sigLine}><Text>Odgovorno lice</Text></View>
          <View style={s.sigLine}><Text>Naručilac radova</Text></View>
          <View style={s.sigLine}><Text>Vozilo preuzeo</Text></View>
        </View>
      </View>

    </Page>
  </Document>
);